package co.edu.unimonserrate.unimonpark.service;

import java.util.List;


import co.edu.unimonserrate.unimonpark.dto.UsuarioRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.UsuarioResponseDTO;

public interface UsuarioService {
    List<UsuarioResponseDTO> listarUsuarios();
    UsuarioResponseDTO buscarPorId(Long id);
    UsuarioResponseDTO crearUsuario(UsuarioRequestDTO dto);
    UsuarioResponseDTO actualizarUsuario(Long id, UsuarioRequestDTO dto);
    void eliminarUsuario(Long id);
}
