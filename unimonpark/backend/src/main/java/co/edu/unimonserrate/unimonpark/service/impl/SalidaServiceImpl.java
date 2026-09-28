package co.edu.unimonserrate.unimonpark.service.impl;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import co.edu.unimonserrate.unimonpark.aspect.Auditable;
import co.edu.unimonserrate.unimonpark.dto.SalidaRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.SalidaResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.EspacioParqueo;
import co.edu.unimonserrate.unimonpark.entity.Ingreso;
import co.edu.unimonserrate.unimonpark.entity.Salida;
import co.edu.unimonserrate.unimonpark.entity.Tarifa;
import co.edu.unimonserrate.unimonpark.entity.Vehiculo;
import co.edu.unimonserrate.unimonpark.enums.EstadoEspacio;
import co.edu.unimonserrate.unimonpark.enums.EstadoIngreso;
import co.edu.unimonserrate.unimonpark.enums.TipoCalculoTarifa;
import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoDisponibleException;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.EspacioParqueoRepository;
import co.edu.unimonserrate.unimonpark.repository.IngresoRepository;
import co.edu.unimonserrate.unimonpark.repository.MembresiaRepository;
import co.edu.unimonserrate.unimonpark.repository.SalidaRepository;
import co.edu.unimonserrate.unimonpark.repository.TarifaRepository;
import co.edu.unimonserrate.unimonpark.service.SalidaService;

@Service
public class SalidaServiceImpl implements SalidaService {

    private final SalidaRepository salidaRepository;
    private final IngresoRepository ingresoRepository;
    private final TarifaRepository tarifaRepository;
    private final EspacioParqueoRepository espacioParqueoRepository;
    private final MembresiaRepository membresiaRepository;

    public SalidaServiceImpl(SalidaRepository salidaRepository,
            IngresoRepository ingresoRepository,
            TarifaRepository tarifaRepository,
            EspacioParqueoRepository espacioParqueoRepository,
            MembresiaRepository membresiaRepository) {
        this.salidaRepository = salidaRepository;
        this.ingresoRepository = ingresoRepository;
        this.tarifaRepository = tarifaRepository;
        this.espacioParqueoRepository = espacioParqueoRepository;
        this.membresiaRepository = membresiaRepository;
    }

    @Override
    public List<SalidaResponseDTO> listarSalidas() {
        return salidaRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    public SalidaResponseDTO buscarPorId(Long id) {
        Salida salida = salidaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Salida no encontrada con id: " + id));
        return convertirADTO(salida);
    }

    @Auditable(tabla = "salida", operacion = TipoOperacion.CREAR)
    @Override
    @org.springframework.transaction.annotation.Transactional
    public SalidaResponseDTO crearSalida(SalidaRequestDTO dto) {

        Ingreso ingreso = ingresoRepository.findById(dto.getIdIngreso())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Ingreso no encontrado con el id: " + dto.getIdIngreso()));

        if (ingreso.getEstado() != EstadoIngreso.ACTIVO) {
            throw new RecursoNoDisponibleException("Este ingreso ya fue cerrado anteriormente");
        }

        Vehiculo vehiculo = ingreso.getVehiculo();
        LocalDateTime fechaSalida = LocalDateTime.now();
        Duration duracion = Duration.between(ingreso.getFechaIngreso(), fechaSalida);
        long minutosTotales = duracion.toMinutes();

        BigDecimal valorTotal;
        Tarifa tarifa = null;

        // 1. Bicicletas: siempre gratis
        if ("Bicicleta".equalsIgnoreCase(vehiculo.getTipoVehiculo().getNombre())) {
            valorTotal = BigDecimal.ZERO;
            if (dto.getIdTarifa() != null) {
                tarifa = tarifaRepository.findById(dto.getIdTarifa()).orElse(null);
            }
            if (tarifa == null) {
                tarifa = tarifaRepository.findAll().stream()
                        .filter(t -> t.getTipoVehiculo() != null
                                && "Bicicleta".equalsIgnoreCase(t.getTipoVehiculo().getNombre()))
                        .findFirst()
                        .orElseGet(() -> tarifaRepository.findAll().stream().findFirst().orElse(null));
            }
        } else if (dto.getModalidadPago() == co.edu.unimonserrate.unimonpark.enums.ModalidadPago.POR_PLANILLA
                || dto.getModalidadPago() == co.edu.unimonserrate.unimonpark.enums.ModalidadPago.ESPECIAL) {
            // Por planilla / nómina / caso especial: $0 en taquilla
            valorTotal = BigDecimal.ZERO;
            tarifa = tarifaRepository.findById(dto.getIdTarifa())
                    .orElseGet(() -> tarifaRepository.findAll().stream().findFirst().orElse(null));
        } else {
            // 2. ¿Tiene membresía activa ahora mismo?
            var membresiaActiva = membresiaRepository
                    .findFirstByVehiculo_IdVehiculoAndFechaFinGreaterThanEqualOrderByFechaFinDesc(
                            vehiculo.getIdVehiculo(), fechaSalida);

            if (membresiaActiva.isPresent()) {
                valorTotal = BigDecimal.ZERO;
                tarifa = membresiaActiva.get().getTarifa();

            } else {
                // 3. Sin membresía (POR_TIEMPO): buscamos la tarifa por idTarifa que envía el
                // cliente
                if (dto.getIdTarifa() == null) {
                    throw new RecursoNoEncontradoException(
                            "Debe indicar la tarifa para vehículos sin membresía activa");
                }
                tarifa = tarifaRepository.findById(dto.getIdTarifa())
                        .orElseThrow(() -> new RecursoNoEncontradoException(
                                "Tarifa no encontrada con id: " + dto.getIdTarifa()));

                valorTotal = calcularValor(tarifa, minutosTotales);
            }
        }

        Salida salida = new Salida();
        salida.setIngreso(ingreso);
        salida.setFechaSalida(fechaSalida);
        salida.setLecturaFinalKm(dto.getLecturaFinalKm());
        salida.setTiempoPermanencia(minutosTotales);
        salida.setValorTotal(valorTotal);
        salida.setObservaciones(dto.getObservaciones());
        salida.setEstado("cerrado");
        salida.setTarifa(tarifa);
        salida.setModalidadPago(dto.getModalidadPago() != null ? dto.getModalidadPago()
                : co.edu.unimonserrate.unimonpark.enums.ModalidadPago.POR_TIEMPO);
        if (tarifa != null) {
            salida.setTipoCalculo(tarifa.getTipoCalculo());
        }

        Salida salidaGuardada = salidaRepository.save(salida);

        ingreso.setEstado(EstadoIngreso.FINALIZADO);
        ingresoRepository.save(ingreso);

        EspacioParqueo espacioParqueo = ingreso.getEspacioParqueo();
        espacioParqueo.setEstado(EstadoEspacio.DISPONIBLE);
        espacioParqueoRepository.save(espacioParqueo);

        return convertirADTO(salidaGuardada);
    }

    private BigDecimal calcularValor(Tarifa tarifa, long minutosTotales) {
        if (tarifa == null) {
            return BigDecimal.ZERO;
        }

        if (tarifa.getTipoCalculo() == TipoCalculoTarifa.MENSUAL) {
            return BigDecimal.ZERO;
        }

        if (tarifa.getTipoCalculo() == TipoCalculoTarifa.PLANA) {
            return tarifa.getValorHora();
        }

        if (tarifa.getTipoCalculo() == TipoCalculoTarifa.POR_TRAMOS && tarifa.getHorasLimite() != null) {
            BigDecimal minutosLimite = tarifa.getHorasLimite().multiply(BigDecimal.valueOf(60));
            boolean dentroDelLimite = BigDecimal.valueOf(minutosTotales).compareTo(minutosLimite) <= 0;
            BigDecimal valorTramo = dentroDelLimite ? tarifa.getValorHastaLimite() : tarifa.getValorDespuesLimite();
            if (valorTramo != null) {
                return valorTramo;
            }
        }

        // Cálculo por hora (POR_HORA o por defecto)
        long horasCobradas = Math.max(1, (minutosTotales + 59) / 60);
        return tarifa.getValorHora().multiply(BigDecimal.valueOf(horasCobradas));
    }

    private SalidaResponseDTO convertirADTO(Salida salida) {
        SalidaResponseDTO dto = new SalidaResponseDTO();
        dto.setIdSalida(salida.getIdSalida());

        Ingreso ingreso = salida.getIngreso();
        dto.setIdIngreso(ingreso.getIdIngreso());

        Vehiculo vehiculo = ingreso.getVehiculo();
        String identificador = vehiculo.getPlaca() != null
                ? vehiculo.getPlaca()
                : "Ficha " + ingreso.getNumeroFicha();
        dto.setPlacaVehiculo(identificador);
        dto.setTipoVehiculo(vehiculo.getTipoVehiculo().getNombre());

        dto.setFechaIngreso(ingreso.getFechaIngreso());
        dto.setFechaSalida(salida.getFechaSalida());
        dto.setLecturaFinalKm(salida.getLecturaFinalKm());
        dto.setTiempoPermanencia(salida.getTiempoPermanencia());
        dto.setValorTotal(salida.getValorTotal());
        dto.setObservaciones(salida.getObservaciones());
        dto.setEstado(salida.getEstado());
        if (salida.getTarifa() != null) {
            dto.setIdTarifa(salida.getTarifa().getIdTarifa());
            dto.setNombreTarifa(salida.getTarifa().getNombre());
        }
        dto.setModalidadPago(salida.getModalidadPago() != null ? salida.getModalidadPago()
                : co.edu.unimonserrate.unimonpark.enums.ModalidadPago.POR_TIEMPO);
        dto.setTipoCalculo(salida.getTipoCalculo());
        dto.setTipoIngreso(ingreso.getTipoIngreso());
        return dto;
    }
}