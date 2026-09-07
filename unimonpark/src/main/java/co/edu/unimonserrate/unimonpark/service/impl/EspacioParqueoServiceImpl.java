package co.edu.unimonserrate.unimonpark.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import co.edu.unimonserrate.unimonpark.aspect.Auditable;
import co.edu.unimonserrate.unimonpark.dto.EspacioParqueoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.EspacioParqueoResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.EspacioParqueo;
import co.edu.unimonserrate.unimonpark.entity.TipoVehiculo;
import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.EspacioParqueoRepository;
import co.edu.unimonserrate.unimonpark.repository.TipoVehiculoRepository;
import co.edu.unimonserrate.unimonpark.service.EspacioParqueoService;

@Service
public class EspacioParqueoServiceImpl implements EspacioParqueoService{
    
    private final EspacioParqueoRepository espacioParqueoRepository;
    private final TipoVehiculoRepository tipoVehiculoRepository;

    public EspacioParqueoServiceImpl(EspacioParqueoRepository espacioParqueoRepository, TipoVehiculoRepository tipoVehiculoRepository){
        this.espacioParqueoRepository = espacioParqueoRepository;
        this.tipoVehiculoRepository = tipoVehiculoRepository;
    }

    @Override
    public List<EspacioParqueoResponseDTO> listarEspacioParqueo(){
        return espacioParqueoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    public EspacioParqueoResponseDTO buscarPorId(Long id){
        EspacioParqueo espacioParqueo = espacioParqueoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Espacio de parqueo no encontrado con id: " + id));
        return convertirADTO(espacioParqueo);
    }

    @Auditable(tabla = "espacio_parqueo", operacion = TipoOperacion.CREAR)
    @Override
    public EspacioParqueoResponseDTO crearEspacioParqueo(EspacioParqueoRequestDTO dto){

        TipoVehiculo tipoVehiculo = tipoVehiculoRepository.findById(dto.getIdTipoVehiculo())
                .orElseThrow(() -> new RecursoNoEncontradoException("Tipo de Vehiculo no encontrado con id: " + dto.getIdTipoVehiculo()));
            
            EspacioParqueo espacioParqueo = new EspacioParqueo();
            espacioParqueo.setCodigo(dto.getCodigo());
            espacioParqueo.setPiso(dto.getPiso());
            espacioParqueo.setZona(dto.getZona());
            espacioParqueo.setEstado(dto.getEstado());
            espacioParqueo.setActivo(dto.getActivo());
            espacioParqueo.setTipoVehiculo(tipoVehiculo);
            EspacioParqueo espacioParqueoGuardado = espacioParqueoRepository.save(espacioParqueo);
            return convertirADTO(espacioParqueoGuardado);
    }

    @Auditable(tabla = "espacio_parqueo", operacion = TipoOperacion.ACTUALIZAR)
    @Override
    public EspacioParqueoResponseDTO actualizarEspacioParqueo(Long id, EspacioParqueoRequestDTO dto){
        EspacioParqueo espacioParqueo = espacioParqueoRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Espacio de Parqueo no encontrado con id: " + id));
        
        TipoVehiculo tipoVehiculo = tipoVehiculoRepository.findById(dto.getIdTipoVehiculo())
            .orElseThrow(() -> new RecursoNoEncontradoException("Tipo de Vehiculo no encontrado con id: " + dto.getIdTipoVehiculo()));

        espacioParqueo.setCodigo(dto.getCodigo());
        espacioParqueo.setPiso(dto.getPiso());
        espacioParqueo.setZona(dto.getZona());
        espacioParqueo.setEstado(dto.getEstado());
        espacioParqueo.setActivo(dto.getActivo());
        espacioParqueo.setTipoVehiculo(tipoVehiculo);

        EspacioParqueo espacioParqueoActualizado = espacioParqueoRepository.save(espacioParqueo);
        return convertirADTO(espacioParqueoActualizado);
    }

    @Auditable(tabla = "espacio_parqueo", operacion = TipoOperacion.ELIMINAR)
    @Override
    public void eliminarEspacioParqueo(Long id){
        espacioParqueoRepository.deleteById(id);
    }

    private EspacioParqueoResponseDTO convertirADTO(EspacioParqueo espacioParqueo){
        EspacioParqueoResponseDTO dto = new EspacioParqueoResponseDTO();
        dto.setIdEspacio(espacioParqueo.getIdEspacio());
        dto.setCodigo(espacioParqueo.getCodigo());
        dto.setPiso(espacioParqueo.getPiso());
        dto.setZona(espacioParqueo.getZona());
        dto.setEstado(espacioParqueo.getEstado());
        dto.setActivo(espacioParqueo.getActivo());
        dto.setIdTipoVehiculo(espacioParqueo.getTipoVehiculo().getNombre());
        dto.setNombreTipoVehiculo(espacioParqueo.getTipoVehiculo().getNombre());
        return dto;
    }
}