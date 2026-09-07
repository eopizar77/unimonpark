package co.edu.unimonserrate.unimonpark.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import co.edu.unimonserrate.unimonpark.aspect.Auditable;
import co.edu.unimonserrate.unimonpark.dto.TarifaRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.TarifaResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.Tarifa;
import co.edu.unimonserrate.unimonpark.entity.TipoVehiculo;
import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.TarifaRepository;
import co.edu.unimonserrate.unimonpark.repository.TipoVehiculoRepository;
import co.edu.unimonserrate.unimonpark.service.TarifaService;

@Service
public class TarifaServiceImpl implements TarifaService{

    private final TarifaRepository tarifaRepository;
    private final TipoVehiculoRepository tipoVehiculoRepository;

    public TarifaServiceImpl(TarifaRepository tarifaRepository, TipoVehiculoRepository tipoVehiculoRepository){
        this.tarifaRepository = tarifaRepository;
        this.tipoVehiculoRepository = tipoVehiculoRepository;
    }
    
    @Override
    public List<TarifaResponseDTO> listarTarifa(){
        return tarifaRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    public TarifaResponseDTO buscarPorId(Long id){
        Tarifa tarifa = tarifaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Tarifa no encontrada con id: " + id));
            return convertirADTO(tarifa);
    }

    
    @Auditable(tabla = "tarifa", operacion = TipoOperacion.CREAR)
    @Override
    public TarifaResponseDTO crearTarifa(TarifaRequestDTO dto){

        TipoVehiculo tipoVehiculo = tipoVehiculoRepository.findById(dto.getIdTipoVehiculo())
                .orElseThrow(() -> new RecursoNoEncontradoException("Tipo de Vehiculo no encontrado con id: " + dto.getIdTipoVehiculo()));

            Tarifa tarifa = new Tarifa();
            tarifa.setNombre(dto.getNombre());
            tarifa.setValorHora(dto.getValorHora());
            tarifa.setActivo(dto.getActivo());
            tarifa.setTipoVehiculo(tipoVehiculo);
            tarifa.setFechaCreacion(LocalDateTime.now());
            Tarifa tarifaGuardado = tarifaRepository.save(tarifa);
            return convertirADTO(tarifaGuardado);
    }

    
    @Auditable(tabla = "tarifa", operacion = TipoOperacion.ACTUALIZAR)
    @Override
    public TarifaResponseDTO actualizarTarifa(Long id, TarifaRequestDTO dto){
        Tarifa tarifa = tarifaRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Tarifa no encontrada con id: " + id));

        TipoVehiculo tipoVehiculo = tipoVehiculoRepository.findById(dto.getIdTipoVehiculo())
            .orElseThrow(() -> new RecursoNoEncontradoException("Tipo de vehiculo no encontrado con id: " + dto.getIdTipoVehiculo()));

        tarifa.setNombre(dto.getNombre());
        tarifa.setValorHora(dto.getValorHora());
        tarifa.setActivo(dto.getActivo());
        tarifa.setTipoVehiculo(tipoVehiculo);

        Tarifa tarifaActualizado = tarifaRepository.save(tarifa);
        return convertirADTO(tarifaActualizado);
    }

    @Auditable(tabla = "tarifa", operacion = TipoOperacion.ELIMINAR)
    @Override
    public void eliminarTarifa(Long id){
        tarifaRepository.deleteById(id);
    }

    private TarifaResponseDTO convertirADTO(Tarifa tarifa){
        TarifaResponseDTO dto = new TarifaResponseDTO();
        dto.setIdTarifa(tarifa.getIdTarifa());
        dto.setNombre(tarifa.getNombre());
        dto.setValorHora(tarifa.getValorHora());
        dto.setActivo(tarifa.getActivo());
        dto.setIdTipoVehiculo(tarifa.getTipoVehiculo().getIdTipoVehiculo());
        dto.setNombreTipoVehiculo(tarifa.getTipoVehiculo().getNombre());
        return dto;
    }
}
