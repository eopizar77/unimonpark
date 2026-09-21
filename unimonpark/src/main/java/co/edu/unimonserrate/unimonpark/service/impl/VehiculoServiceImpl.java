package co.edu.unimonserrate.unimonpark.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import co.edu.unimonserrate.unimonpark.aspect.Auditable;
import co.edu.unimonserrate.unimonpark.dto.VehiculoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.VehiculoResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.Externo;
import co.edu.unimonserrate.unimonpark.entity.TipoVehiculo;
import co.edu.unimonserrate.unimonpark.entity.Usuario;
import co.edu.unimonserrate.unimonpark.entity.Vehiculo;
import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoDisponibleException;
import co.edu.unimonserrate.unimonpark.repository.ExternoRepository;
import co.edu.unimonserrate.unimonpark.repository.TipoVehiculoRepository;
import co.edu.unimonserrate.unimonpark.repository.UsuarioRepository;
import co.edu.unimonserrate.unimonpark.repository.VehiculoRepository;
import co.edu.unimonserrate.unimonpark.service.VehiculoService;

@Service
public class VehiculoServiceImpl implements VehiculoService {

    private final VehiculoRepository vehiculoRepository;
    private final TipoVehiculoRepository tipoVehiculoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ExternoRepository externoRepository;

    public VehiculoServiceImpl(VehiculoRepository vehiculoRepository, TipoVehiculoRepository tipoVehiculoRepository,
            UsuarioRepository usuarioRepository, ExternoRepository externoRepository) {
        this.vehiculoRepository = vehiculoRepository;
        this.tipoVehiculoRepository = tipoVehiculoRepository;
        this.usuarioRepository = usuarioRepository;
        this.externoRepository = externoRepository;
    }

    @Override
    public List<VehiculoResponseDTO> listarVehiculos() {
        return vehiculoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    public VehiculoResponseDTO buscarPorId(Long id) {
        Vehiculo vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Vehiculo, no encontrado con id: " + id));
        return convertirADTO(vehiculo);
    }

    @Auditable(tabla = "vehiculo", operacion = TipoOperacion.CREAR)
    @Override
    public VehiculoResponseDTO crearVehiculo(VehiculoRequestDTO dto) {

        // Validación: debe existir exactamente uno entre usuario o externo
        if (dto.getIdUsuario() == null && dto.getIdExterno() == null) {
            throw new RecursoNoEncontradoException("El vehículo debe estar asociado a un usuario o a un externo");
        }
        if (dto.getIdUsuario() != null && dto.getIdExterno() != null) {
            throw new RecursoNoDisponibleException(
                    "El vehículo no puede estar asociado a un usuario Y a un externo al mismo tiempo");
        }

        TipoVehiculo tipoVehiculo = tipoVehiculoRepository.findById(dto.getIdTipoVehiculo())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Tipo de Vehiculo no encontrado con id: " + dto.getIdTipoVehiculo()));

        Vehiculo vehiculo = new Vehiculo();

        // Asignar usuario o externo según corresponda
        if (dto.getIdUsuario() != null) {
            Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Usuario no encontrado con id: " + dto.getIdUsuario()));
            vehiculo.setUsuario(usuario);
            vehiculo.setExterno(null);
        } else {
            Externo externo = externoRepository.findById(dto.getIdExterno())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Externo no encontrado con id: " + dto.getIdExterno()));
            vehiculo.setExterno(externo);
            vehiculo.setUsuario(null);
        }

        if (dto.getPlaca() != null && !dto.getPlaca().isBlank()) {
            String placa = dto.getPlaca().trim().toUpperCase();
            if (vehiculoRepository.existsByPlaca(placa)) {
                throw new RecursoNoDisponibleException("La placa " + placa + " ya está registrada");
            }
            vehiculo.setPlaca(placa);
        } else {
            vehiculo.setPlaca(null);
        }

        vehiculo.setMarca(dto.getMarca());
        vehiculo.setModelo(dto.getModelo());
        vehiculo.setColor(dto.getColor());
        vehiculo.setTipoVehiculo(tipoVehiculo);
        vehiculo.setActivo(dto.getActivo());
        vehiculo.setFechaCreacion(LocalDateTime.now());
        vehiculo.setCategoriaPersona(dto.getCategoriaPersona());

        Vehiculo vehiculoGuardado = vehiculoRepository.save(vehiculo);
        return convertirADTO(vehiculoGuardado);
    }

    @Auditable(tabla = "vehiculo", operacion = TipoOperacion.ACTUALIZAR)
    @Override
    public VehiculoResponseDTO actualizarVehiculo(Long id, VehiculoRequestDTO dto) {
        Vehiculo vehiculo = vehiculoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Vehiculo no encontrado con el id: " + id));

        TipoVehiculo tipoVehiculo = tipoVehiculoRepository.findById(dto.getIdTipoVehiculo())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Tipo de Vehiculo no encontrado con id: " + dto.getIdTipoVehiculo()));

        if (dto.getIdUsuario() != null) {
            Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Usuario no encontrado con id: " + dto.getIdUsuario()));
            vehiculo.setUsuario(usuario);
            vehiculo.setExterno(null);
        } else {
            Externo externo = externoRepository.findById(dto.getIdExterno())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Externo no encontrado con id: " + dto.getIdExterno()));
            vehiculo.setExterno(externo);
            vehiculo.setUsuario(null);
        }

        if (dto.getPlaca() != null && !dto.getPlaca().isBlank()) {
            String placa = dto.getPlaca().trim().toUpperCase();
            if (vehiculoRepository.existsByPlacaAndIdVehiculoNot(placa, id)) {
                throw new RecursoNoDisponibleException("La placa " + placa + " ya está registrada en otro vehículo");
            }
            vehiculo.setPlaca(placa);
        } else {
            vehiculo.setPlaca(null);
        }

        vehiculo.setMarca(dto.getMarca());
        vehiculo.setModelo(dto.getModelo());
        vehiculo.setColor(dto.getColor());
        vehiculo.setTipoVehiculo(tipoVehiculo);
        vehiculo.setActivo(dto.getActivo());
        vehiculo.setCategoriaPersona(dto.getCategoriaPersona());

        Vehiculo vehiculoActualizado = vehiculoRepository.save(vehiculo);
        return convertirADTO(vehiculoActualizado);
    }

    @Auditable(tabla = "vehiculo", operacion = TipoOperacion.ELIMINAR)
    @Override
    public void eliminarVehiculo(Long id) {
        vehiculoRepository.deleteById(id);
    }

    private VehiculoResponseDTO convertirADTO(Vehiculo vehiculo) {

        VehiculoResponseDTO dto = new VehiculoResponseDTO();
        dto.setIdVehiculo(vehiculo.getIdVehiculo());
        dto.setPlaca(vehiculo.getPlaca());
        dto.setMarca(vehiculo.getMarca());
        dto.setModelo(vehiculo.getModelo());
        dto.setColor(vehiculo.getColor());
        dto.setIdTipoVehiculo(vehiculo.getTipoVehiculo().getIdTipoVehiculo());
        dto.setNombreTipoVehiculo(vehiculo.getTipoVehiculo().getNombre());
        dto.setActivo(vehiculo.getActivo());
        dto.setCategoriaPersona(vehiculo.getCategoriaPersona());
        dto.setFechaCreacion(vehiculo.getFechaCreacion());

        if (vehiculo.getUsuario() != null) {
            dto.setIdUsuario(vehiculo.getUsuario().getIdUsuario());
            dto.setNombreUsuario(vehiculo.getUsuario().getNombreUsuario());
        }

        if (vehiculo.getExterno() != null) {
            dto.setIdExterno(vehiculo.getExterno().getIdExterno());
            dto.setNombreExterno(vehiculo.getExterno().getNombres() + " " + vehiculo.getExterno().getApellidos());
            dto.setDocumentoExterno(vehiculo.getExterno().getNumeroDocumento());
        }
        return dto;
    }
}