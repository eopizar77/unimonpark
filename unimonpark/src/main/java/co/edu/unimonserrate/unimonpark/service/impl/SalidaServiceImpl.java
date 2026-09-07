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
import co.edu.unimonserrate.unimonpark.enums.EstadoEspacio;
import co.edu.unimonserrate.unimonpark.enums.EstadoIngreso;
import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoDisponibleException;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.EspacioParqueoRepository;
import co.edu.unimonserrate.unimonpark.repository.IngresoRepository;
import co.edu.unimonserrate.unimonpark.repository.SalidaRepository;
import co.edu.unimonserrate.unimonpark.repository.TarifaRepository;
import co.edu.unimonserrate.unimonpark.service.SalidaService;

@Service
public class SalidaServiceImpl implements SalidaService {
    
    private final SalidaRepository salidaRepository;
    private final IngresoRepository ingresoRepository;
    private final TarifaRepository tarifaRepository;
    private final EspacioParqueoRepository espacioParqueoRepository;

    public SalidaServiceImpl(SalidaRepository salidaRepository,
                                IngresoRepository ingresoRepository,
                                TarifaRepository tarifaRepository,
                                EspacioParqueoRepository espacioParqueoRepository){
        this.salidaRepository = salidaRepository;
        this.ingresoRepository = ingresoRepository;
        this.tarifaRepository = tarifaRepository;
        this.espacioParqueoRepository = espacioParqueoRepository;
    }

    @Override
    public List<SalidaResponseDTO> listarSalidas(){
        return salidaRepository.findAll()
        .stream()
        .map(this::convertirADTO)
        .collect(Collectors.toList());
        }
        
    @Override
    public SalidaResponseDTO buscarPorId(Long id){
        Salida salida = salidaRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Salida no encontrada con id: " + id));
        return convertirADTO(salida);
    }

    @Auditable(tabla = "salida", operacion = TipoOperacion.CREAR)
    @Override
    public SalidaResponseDTO crearSalida(SalidaRequestDTO dto){

        Ingreso ingreso = ingresoRepository.findById(dto.getIdIngreso())
            .orElseThrow(() -> new RecursoNoEncontradoException("Ingreso no encontrado con el id: " + dto.getIdIngreso()));
        
        if(ingreso.getEstado() != EstadoIngreso.ACTIVO){
            throw new RecursoNoDisponibleException("Este ingreso ya fue cerrado anteriormente");
        }

        Tarifa tarifa = tarifaRepository.findById(dto.getIdTarifa())
            .orElseThrow(() -> new RecursoNoEncontradoException("Tarifa no encontrada con id: " + dto.getIdTarifa()));
    

    LocalDateTime fechaSalida = LocalDateTime.now();
    Duration duration = Duration.between(ingreso.getFechaIngreso(), fechaSalida);

    long minutosTotales = duration.toMinutes();
    long horasCobradas = Math.max(1, (minutosTotales + 59) / 60);
    BigDecimal valorTotal = tarifa.getValorHora().multiply(BigDecimal.valueOf(horasCobradas));

    Salida salida = new Salida();
    salida.setIngreso(ingreso);
    salida.setFechaSalida(fechaSalida);
    salida.setLecturaFinalKm(dto.getLecturaFinalKm());
    salida.setTiempoPermanencia(minutosTotales);
    salida.setValorTotal(valorTotal);
    salida.setObservaciones(dto.getObservaciones());
    salida.setEstado("cerrado");
    salida.setTarifa(tarifa);

    Salida salidaGuardada = salidaRepository.save(salida);

    //Cerrar el ingreso
    ingreso.setEstado(EstadoIngreso.FINALIZADO);
    ingresoRepository.save(ingreso);

    //Liberar el espacio de parqueo
    EspacioParqueo espacioParqueo = ingreso.getEspacioParqueo();
    espacioParqueo.setEstado(EstadoEspacio.DISPONIBLE);
    espacioParqueoRepository.save(espacioParqueo);

    return convertirADTO(salidaGuardada);
    }

    private SalidaResponseDTO convertirADTO(Salida salida){
        SalidaResponseDTO dto = new SalidaResponseDTO();
        dto.setIdSalida(salida.getIdSalida());
        dto.setIdIngreso(salida.getIngreso().getIdIngreso());
        dto.setPlacaVehiculo(salida.getIngreso().getVehiculo().getPlaca());
        dto.setFechaIngreso(salida.getIngreso().getFechaIngreso());
        dto.setFechaSalida(salida.getFechaSalida());
        dto.setLecturaFinalKm(salida.getLecturaFinalKm());
        dto.setTiempoPermanencia(salida.getTiempoPermanencia());
        dto.setValorTotal(salida.getValorTotal());
        dto.setObservaciones(salida.getObservaciones());
        dto.setEstado(salida.getEstado());
        dto.setIdTarifa(salida.getTarifa().getIdTarifa());
        dto.setNombreTarifa(salida.getTarifa().getNombre());
        return dto;
    }

}
