package co.edu.unimonserrate.unimonpark.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unimonserrate.unimonpark.dto.RolDTO;
import co.edu.unimonserrate.unimonpark.service.RolService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/roles")

public class RolController {

    private final RolService rolService;

    public RolController(RolService rolservice){
        this.rolService = rolservice;
    }

    @GetMapping
    public ResponseEntity<List<RolDTO>> listarRoles(){
        //List<RolDTO> roles = rolService.listarRoles();//
        return ResponseEntity.ok(rolService.listarRoles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RolDTO> buscarPorId(@PathVariable Long id){
        //RolDTO rol = rolService.buscarPorId(id);//
        return ResponseEntity.ok(rolService.buscarPorId(id));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping
    public ResponseEntity<RolDTO> crearRol(@Valid @RequestBody RolDTO rolDTO){
        RolDTO rolCreado = rolService.guardarRol(rolDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(rolCreado);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/{id}")
    public ResponseEntity<RolDTO> actualizarRol(@PathVariable Long id, @Valid @RequestBody RolDTO rolDTO){
        rolDTO.setIdRol(id);
        //RolDTO rolActualizado = rolService.guardarRol(rolDTO);//
        return ResponseEntity.ok(rolService.guardarRol(rolDTO));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRol(@PathVariable Long id){
        rolService.eliminarRol(id);
        return ResponseEntity.noContent().build();
    }    
}
