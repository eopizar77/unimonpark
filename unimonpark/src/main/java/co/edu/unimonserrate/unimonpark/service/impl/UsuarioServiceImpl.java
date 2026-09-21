package co.edu.unimonserrate.unimonpark.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import co.edu.unimonserrate.unimonpark.aspect.Auditable;
import co.edu.unimonserrate.unimonpark.dto.UsuarioRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.UsuarioResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.Rol;
import co.edu.unimonserrate.unimonpark.entity.Usuario;
import co.edu.unimonserrate.unimonpark.entity.PerfilUsuarioTarifa;
import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.RolRepository;
import co.edu.unimonserrate.unimonpark.repository.UsuarioRepository;
import co.edu.unimonserrate.unimonpark.repository.PerfilUsuarioTarifaRepository;
import co.edu.unimonserrate.unimonpark.service.UsuarioService;

@Service
public class UsuarioServiceImpl implements UsuarioService{

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final PerfilUsuarioTarifaRepository perfilUsuarioTarifaRepository;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, RolRepository rolRepository,
                              PasswordEncoder passwordEncoder,
                              PerfilUsuarioTarifaRepository perfilUsuarioTarifaRepository){
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.perfilUsuarioTarifaRepository = perfilUsuarioTarifaRepository;
    }

    @Override
    public List<UsuarioResponseDTO> listarUsuarios(){
        return usuarioRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    public UsuarioResponseDTO buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id));
        return convertirADTO(usuario);
    }

    @Auditable(tabla = "usuarios", operacion = TipoOperacion.CREAR)
    @Override
    public UsuarioResponseDTO crearUsuario(UsuarioRequestDTO dto){
        Rol rol = rolRepository.findById(dto.getIdRol())
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol no encontrado con el id: " + dto.getIdRol()));

            Usuario usuario = new Usuario();
            usuario.setNombres(dto.getNombres());
            usuario.setApellidos(dto.getApellidos());
            usuario.setDocumento(dto.getDocumento());
            usuario.setCorreo(dto.getCorreo());
            usuario.setTelefono(dto.getTelefono());
            usuario.setNombreUsuario(dto.getNombreUsuario());
            usuario.setContrasenaHash(passwordEncoder.encode(dto.getContrasena()));
            usuario.setRol(rol);
            usuario.setPerfilUsuarioTarifa(obtenerPerfil(dto.getIdPerfilUsuarioTarifa()));
            usuario.setVoluntarioCentroObrero(Boolean.TRUE.equals(dto.getVoluntarioCentroObrero()));
            usuario.setActivo(dto.getActivo());
            usuario.setFechaCreacion(LocalDateTime.now());
            Usuario usuarioGuardado = usuarioRepository.save(usuario);
            return convertirADTO(usuarioGuardado);
    }

    @Auditable(tabla = "usuarios", operacion = TipoOperacion.ACTUALIZAR)
    @Override
    public UsuarioResponseDTO actualizarUsuario(Long id, UsuarioRequestDTO dto){
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con el id: " + id));

        Rol rol = rolRepository.findById(dto.getIdRol())
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol no encontrado con el id: " + dto.getIdRol()));
        usuario.setNombres(dto.getNombres());
        usuario.setApellidos(dto.getApellidos());
        usuario.setDocumento(dto.getDocumento());
        usuario.setCorreo(dto.getCorreo());
        usuario.setTelefono(dto.getTelefono());
        usuario.setNombreUsuario(dto.getNombreUsuario());
        usuario.setContrasenaHash(passwordEncoder.encode(dto.getContrasena()));
        usuario.setRol(rol);
        usuario.setPerfilUsuarioTarifa(obtenerPerfil(dto.getIdPerfilUsuarioTarifa()));
        usuario.setVoluntarioCentroObrero(Boolean.TRUE.equals(dto.getVoluntarioCentroObrero()));
        usuario.setActivo(dto.getActivo());
        usuario.setFechaActualizacion(LocalDateTime.now());

        Usuario usuarioActualizado = usuarioRepository.save(usuario);
        return convertirADTO(usuarioActualizado);
    }

    @Auditable(tabla = "usuarios", operacion = TipoOperacion.ELIMINAR)
    @Override
    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    private UsuarioResponseDTO convertirADTO(Usuario usuario){
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setIdUsuario(usuario.getIdUsuario());
        dto.setNombres(usuario.getNombres());
        dto.setApellidos(usuario.getApellidos());
        dto.setDocumento(usuario.getDocumento());
        dto.setCorreo(usuario.getCorreo());
        dto.setTelefono(usuario.getTelefono());
        dto.setNombreUsuario(usuario.getNombreUsuario());
        dto.setIdRol(usuario.getRol().getIdRol());
        dto.setNombreRol(usuario.getRol().getNombre());
        if (usuario.getPerfilUsuarioTarifa() != null) {
            dto.setIdPerfilUsuarioTarifa(usuario.getPerfilUsuarioTarifa().getIdPerfilUsuarioTarifa());
            dto.setNombrePerfilUsuarioTarifa(usuario.getPerfilUsuarioTarifa().getNombre());
        }
        dto.setVoluntarioCentroObrero(usuario.getVoluntarioCentroObrero());
        dto.setActivo(usuario.getActivo());
        dto.setFechaCreacion(usuario.getFechaCreacion());
        dto.setFechaActualizacion(usuario.getFechaActualizacion());
        return dto;
    }

    private PerfilUsuarioTarifa obtenerPerfil(Long idPerfilUsuarioTarifa) {
        if (idPerfilUsuarioTarifa == null) {
            return null;
        }
        return perfilUsuarioTarifaRepository.findById(idPerfilUsuarioTarifa)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Perfil de usuario para tarifa no encontrado con id: " + idPerfilUsuarioTarifa));
    }
}