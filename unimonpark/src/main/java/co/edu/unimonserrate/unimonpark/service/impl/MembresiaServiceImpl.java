package co.edu.unimonserrate.unimonpark.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import co.edu.unimonserrate.unimonpark.dto.MembresiaRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.MembresiaResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.Membresia;
import co.edu.unimonserrate.unimonpark.entity.Tarifa;
import co.edu.unimonserrate.unimonpark.entity.Usuario;
import co.edu.unimonserrate.unimonpark.entity.Vehiculo;
import co.edu.unimonserrate.unimonpark.enums.CategoriaPersona;
import co.edu.unimonserrate.unimonpark.enums.TipoCalculoTarifa;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoDisponibleException;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.MembresiaRepository;
import co.edu.unimonserrate.unimonpark.repository.TarifaRepository;
import co.edu.unimonserrate.unimonpark.repository.VehiculoRepository;
import co.edu.unimonserrate.unimonpark.service.MembresiaService;

@Service
public class MembresiaServiceImpl implements MembresiaService {

    private final MembresiaRepository membresiaRepository;
    private final VehiculoRepository vehiculoRepository;
    private final TarifaRepository tarifaRepository;

    public MembresiaServiceImpl(MembresiaRepository membresiaRepository,
            VehiculoRepository vehiculoRepository,
            TarifaRepository tarifaRepository) {
        this.membresiaRepository = membresiaRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.tarifaRepository = tarifaRepository;
    }

    @Override
    public List<MembresiaResponseDTO> listarMembresias() {
        return membresiaRepository.findAll().stream()
                .map(this::convertirADTO).collect(Collectors.toList());
    }

    @Override
    public MembresiaResponseDTO buscarPorId(Long id) {
        Membresia m = membresiaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Membresía no encontrada con id: " + id));
        return convertirADTO(m);
    }

    @Override
    public MembresiaResponseDTO crearMembresia(MembresiaRequestDTO dto) {
        Vehiculo vehiculo = vehiculoRepository.findById(dto.getIdVehiculo())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Vehículo no encontrado con id: " + dto.getIdVehiculo()));
        Tarifa tarifa = tarifaRepository.findById(dto.getIdTarifa())
                .orElseThrow(
                        () -> new RecursoNoEncontradoException("Tarifa no encontrada con id: " + dto.getIdTarifa()));

        LocalDateTime inicio = LocalDateTime.now();

        Membresia m = new Membresia();
        m.setVehiculo(vehiculo);
        m.setTarifa(tarifa);
        m.setFechaInicio(inicio);
        m.setFechaFin(inicio.plusMonths(1));
        m.setMontoPagado(calcularMontoMembresia(vehiculo, tarifa));
        m.setFechaCreacion(inicio);

        return convertirADTO(membresiaRepository.save(m));
    }

    private BigDecimal calcularMontoMembresia(Vehiculo vehiculo, Tarifa tarifa) {
        if (tarifa.getTipoCalculo() != TipoCalculoTarifa.MENSUAL) {
            return tarifa.getValorHora() != null ? tarifa.getValorHora() : BigDecimal.ZERO;
        }

        // Prioridad 1: si la tarifa tiene porcentaje configurado (ej. carros), se
        // calcula sobre matrícula/salario
        if (tarifa.getPorcentaje() != null) {
            Usuario usuario = vehiculo.getUsuario();
            if (usuario == null) {
                throw new RecursoNoDisponibleException(
                        "Las membresías con porcentaje solo aplican para usuarios del sistema, no para externos");
            }
            BigDecimal base = vehiculo.getCategoriaPersona() == CategoriaPersona.ESTUDIANTE
                    ? usuario.getValorMatricula()
                    : usuario.getValorSalario();

            if (base == null) {
                throw new RecursoNoDisponibleException(
                        "El usuario no tiene valor de matrícula/salario registrado, necesario para calcular la mensualidad");
            }
            BigDecimal calculado = base.multiply(tarifa.getPorcentaje()).divide(BigDecimal.valueOf(100));
            return redondearMultiplo10000(calculado);
        }

        // Prioridad 2: si no tiene porcentaje, se usa el valor fijo (ej. motos)
        if (tarifa.getValorHora() != null) {
            return tarifa.getValorHora();
        }

        throw new RecursoNoDisponibleException("La tarifa mensual no tiene porcentaje ni valor fijo configurado");
    }

    /** Redondea hacia arriba al múltiplo de 10.000 más cercano */
    private BigDecimal redondearMultiplo10000(BigDecimal valor) {
        BigDecimal multiplo = BigDecimal.valueOf(10000);
        // divide → redondea ceiling → multiplica de vuelta
        return valor.divide(multiplo, 0, java.math.RoundingMode.CEILING)
                .multiply(multiplo);
    }

    private MembresiaResponseDTO convertirADTO(Membresia m) {
        MembresiaResponseDTO dto = new MembresiaResponseDTO();
        dto.setIdMembresia(m.getIdMembresia());
        dto.setIdVehiculo(m.getVehiculo().getIdVehiculo());
        dto.setPlacaVehiculo(m.getVehiculo().getPlaca());
        dto.setIdTarifa(m.getTarifa().getIdTarifa());
        dto.setNombreTarifa(m.getTarifa().getNombre());
        dto.setFechaInicio(m.getFechaInicio());
        dto.setFechaFin(m.getFechaFin());
        dto.setMontoPagado(m.getMontoPagado());
        dto.setActiva(m.getFechaFin().isAfter(LocalDateTime.now()));
        return dto;
    }

}
