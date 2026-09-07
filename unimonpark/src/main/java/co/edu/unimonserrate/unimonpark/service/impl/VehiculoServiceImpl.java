package co.edu.unimonserrate.unimonpark.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import co.edu.unimonserrate.unimonpark.aspect.Auditable;
import co.edu.unimonserrate.unimonpark.dto.VehiculoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.VehiculoResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.TipoVehiculo;
import co.edu.unimonserrate.unimonpark.entity.Usuario;
import co.edu.unimonserrate.unimonpark.entity.Vehiculo;
import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.TipoVehiculoRepository;
import co.edu.unimonserrate.unimonpark.repository.UsuarioRepository;
import co.edu.unimonserrate.unimonpark.repository.VehiculoRepository;
import co.edu.unimonserrate.unimonpark.service.VehiculoService;

@Service
public class VehiculoServiceImpl implements VehiculoService{

    private final VehiculoRepository vehiculoRepository;
    private final TipoVehiculoRepository tipoVehiculoRepository;
    private final UsuarioRepository usuarioRepository;

    public VehiculoServiceImpl(VehiculoRepository vehiculoRepository, TipoVehiculoRepository tipoVehiculoRepository, UsuarioRepository usuarioRepository){
        this.vehiculoRepository = vehiculoRepository;
        this.tipoVehiculoRepository = tipoVehiculoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public List<VehiculoResponseDTO> listarVehiculos(){
        return vehiculoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    public VehiculoResponseDTO buscarPorId(Long id){
        Vehiculo vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Vehiculo, no encontrado con id: " + id));
        return convertirADTO(vehiculo);
    }

    @Auditable(tabla = "vehiculo", operacion = TipoOperacion.CREAR)
    @Override
    public VehiculoResponseDTO crearVehiculo(VehiculoRequestDTO dto){

        TipoVehiculo tipoVehiculo = tipoVehiculoRepository.findById(dto.getIdTipoVehiculo())
                .orElseThrow(() -> new RecursoNoEncontradoException("Tipo de Vehiculo no encontrado con id: " + dto.getIdTipoVehiculo()));

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuarios no encontrado con el id: " + dto.getIdUsuario()));

            Vehiculo vehiculo = new Vehiculo();
            vehiculo.setPlaca(dto.getPlaca());
            vehiculo.setMarca(dto.getMarca());
            vehiculo.setModelo(dto.getModelo());
            vehiculo.setColor(dto.getColor());
            vehiculo.setTipoVehiculo(tipoVehiculo);
            vehiculo.setUsuarios(usuario);
            vehiculo.setActivo(dto.getActivo());
            vehiculo.setFechaCreacion(LocalDateTime.now());
            Vehiculo vehiculoGuardado = vehiculoRepository.save(vehiculo);
            return convertirADTO(vehiculoGuardado);
    }

    @Auditable(tabla = "vehiculo", operacion = TipoOperacion.ACTUALIZAR)
    @Override
    public VehiculoResponseDTO actualizarVehiculo(Long id, VehiculoRequestDTO dto){
        Vehiculo vehiculo = vehiculoRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Vehiculo no encontrado con el id: " + id));

        TipoVehiculo tipoVehiculo = tipoVehiculoRepository.findById(dto.getIdTipoVehiculo())
            .orElseThrow(() -> new RecursoNoEncontradoException("Tipo de Vehiculo no encontrado con id: " + dto.getIdTipoVehiculo()));
        
        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
            .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con el id: " + dto.getIdUsuario()));
        
        vehiculo.setPlaca(dto.getPlaca());
        vehiculo.setMarca(dto.getMarca());
        vehiculo.setModelo(dto.getModelo());
        vehiculo.setColor(dto.getColor());
        vehiculo.setTipoVehiculo(tipoVehiculo);
        vehiculo.setUsuarios(usuario);
        vehiculo.setActivo(dto.getActivo());
        
        Vehiculo vehiculoActualizado = vehiculoRepository.save(vehiculo);
        return convertirADTO(vehiculoActualizado);
    }

    @Auditable(tabla = "vehiculo", operacion = TipoOperacion.ELIMINAR)
    @Override
    public void eliminarVehiculo(Long id){
        vehiculoRepository.deleteById(id);
    }

    private VehiculoResponseDTO convertirADTO(Vehiculo vehiculo){
        VehiculoResponseDTO dto = new VehiculoResponseDTO();
        dto.setIdVehiculo(vehiculo.getIdVehiculo());
        dto.setPlaca(vehiculo.getPlaca());
        dto.setMarca(vehiculo.getMarca());
        dto.setModelo(vehiculo.getModelo());
        dto.setColor(vehiculo.getColor());
        dto.setIdTipoVehiculo(vehiculo.getTipoVehiculo().getIdTipoVehiculo());
        dto.setNombreTipoVehiculo(vehiculo.getTipoVehiculo().getNombre());
        dto.setIdUsuario(vehiculo.getUsuarios().getIdUsuario());
        dto.setNombreUsuario(vehiculo.getUsuarios().getNombreUsuario());
        dto.setActivo(vehiculo.getActivo());
        dto.setFechaCreacion(vehiculo.getFechaCreacion());
        return dto;
    }
}