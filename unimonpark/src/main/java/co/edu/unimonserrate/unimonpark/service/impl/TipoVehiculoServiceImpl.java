package co.edu.unimonserrate.unimonpark.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import co.edu.unimonserrate.unimonpark.aspect.Auditable;
import co.edu.unimonserrate.unimonpark.dto.TipoVehiculoDTO;
import co.edu.unimonserrate.unimonpark.entity.TipoVehiculo;
import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.TipoVehiculoRepository;
import co.edu.unimonserrate.unimonpark.service.TipoVehiculoService;

@Service
public class TipoVehiculoServiceImpl implements TipoVehiculoService{

    private final TipoVehiculoRepository tipoVehiculoRepository;

    public TipoVehiculoServiceImpl(TipoVehiculoRepository tipoVehiculoRepository){
        this.tipoVehiculoRepository = tipoVehiculoRepository;
    }

@Override
    public List<TipoVehiculoDTO> listarTipoVehiculo(){
        return tipoVehiculoRepository.findAll()
        .stream()
        .map(this::convertirADTO)
        .collect(Collectors.toList());
    }

@Auditable(tabla = "tipos_vehiculos", operacion = TipoOperacion.CREAR)
    @Override
    public TipoVehiculoDTO guardarTipoVehiculo(TipoVehiculoDTO dto){
        TipoVehiculo tipoVehiculo = convertirAEntity(dto);
        TipoVehiculo guardarTipoVehiculo = tipoVehiculoRepository.save(tipoVehiculo);
        return convertirADTO(guardarTipoVehiculo);
    }

@Override
    public TipoVehiculoDTO buscarPorId(Long id){
        TipoVehiculo tipoVehiculo = tipoVehiculoRepository.findById(id)
        .orElseThrow(() -> new RecursoNoEncontradoException("Tipo de vehiculo no encontrado con ID: " + id));
        return convertirADTO(tipoVehiculo);
    }

@Auditable(tabla = "tipos_vehiculos", operacion = TipoOperacion.ELIMINAR)
@Override
    public void eliminarTipoVehiculo(Long id){
        tipoVehiculoRepository.deleteById(id);
    }

//Metodos de Conversion

    private TipoVehiculoDTO convertirADTO(TipoVehiculo tipoVehiculo){
        return new TipoVehiculoDTO(
            tipoVehiculo.getIdTipoVehiculo(),
            tipoVehiculo.getNombre(),
            tipoVehiculo.getDescripcion(),
            tipoVehiculo.getActivo()
        );
    }

    private TipoVehiculo convertirAEntity(TipoVehiculoDTO dto){
        TipoVehiculo tipoVehiculo = new TipoVehiculo();
        tipoVehiculo.setIdTipoVehiculo(dto.getIdTipoVehiculo());
        tipoVehiculo.setNombre(dto.getNombre());
        tipoVehiculo.setDescripcion(dto.getDescripcion());
        tipoVehiculo.setActivo(dto.getActivo());
        return tipoVehiculo;
    }
}
