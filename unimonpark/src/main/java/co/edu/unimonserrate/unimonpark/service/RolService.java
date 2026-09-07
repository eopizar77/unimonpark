package co.edu.unimonserrate.unimonpark.service;

import java.util.List;
import co.edu.unimonserrate.unimonpark.dto.RolDTO;

public interface RolService {

    List<RolDTO> listarRoles();
    RolDTO guardarRol(RolDTO rol);
    RolDTO buscarPorId(Long id);
    void eliminarRol(Long id);
}