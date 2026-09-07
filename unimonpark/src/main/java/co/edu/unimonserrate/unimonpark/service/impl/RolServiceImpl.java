package co.edu.unimonserrate.unimonpark.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import co.edu.unimonserrate.unimonpark.aspect.Auditable;
import co.edu.unimonserrate.unimonpark.dto.RolDTO;
import co.edu.unimonserrate.unimonpark.entity.Rol;
import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.RolRepository;
import co.edu.unimonserrate.unimonpark.service.RolService;

@Service
public class RolServiceImpl implements RolService{

    private final RolRepository rolRepository;

    public RolServiceImpl(RolRepository rolRepository){
        this.rolRepository = rolRepository;
    }

    @Override
    public List<RolDTO> listarRoles(){
        return rolRepository.findAll()
            .stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }
    
    @Auditable(tabla = "roles", operacion = TipoOperacion.CREAR) 
    @Override
    public RolDTO guardarRol(RolDTO dto){
        Rol rol = convertirAEntity(dto);
        Rol rolGuardado = rolRepository.save(rol);
        return convertirADTO(rolGuardado);

    }

    @Override
    public RolDTO buscarPorId(Long id){
        Rol rol = rolRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Rol no encontrado con id: " + id));
            return convertirADTO(rol);
    }

    @Auditable(tabla = "roles", operacion = TipoOperacion.ELIMINAR)
    @Override
    public void eliminarRol(Long id){
        rolRepository.deleteById(id);
    }

    //Metodo conversion

    private RolDTO convertirADTO(Rol rol){
        return new RolDTO(
            rol.getIdRol(),
            rol.getNombre(),
            rol.getDescripcion(),
            rol.getActivo()
        );
    }

    private Rol convertirAEntity(RolDTO dto){
        Rol rol = new Rol();
        rol.setIdRol(dto.getIdRol());
        rol.setNombre(dto.getNombre());
        rol.setDescripcion(dto.getDescripcion());
        rol.setActivo(dto.getActivo());
        return rol;
    }
}