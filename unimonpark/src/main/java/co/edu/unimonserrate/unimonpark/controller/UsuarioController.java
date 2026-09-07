package co.edu.unimonserrate.unimonpark.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unimonserrate.unimonpark.dto.UsuarioRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.UsuarioResponseDTO;
import co.edu.unimonserrate.unimonpark.service.UsuarioService;
import jakarta.validation.Valid;

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


@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

        public UsuarioController(UsuarioService usuarioService){
            this.usuarioService = usuarioService;
        }

        @GetMapping
        public ResponseEntity<List<UsuarioResponseDTO>> listarUsuarios(){
            return ResponseEntity.ok(usuarioService.listarUsuarios());
        }

        @GetMapping("/{id}")
        public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable Long id){
            return ResponseEntity.ok(usuarioService.buscarPorId(id));
        }

        @PreAuthorize("hasRole('ADMINISTRADOR')")
        @PostMapping
        public ResponseEntity<UsuarioResponseDTO> crearUsuario(@Valid @RequestBody UsuarioRequestDTO usuarioDTO){
            UsuarioResponseDTO usuarioCreado = usuarioService.crearUsuario(usuarioDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(usuarioCreado);
        }

        @PreAuthorize("hasRole('ADMINISTRADOR')")
        @PutMapping("/{id}")
        public ResponseEntity<UsuarioResponseDTO> actualizarUsuario(@PathVariable Long id, @Valid @RequestBody UsuarioRequestDTO dto){
            return ResponseEntity.ok(usuarioService.actualizarUsuario(id, dto));
        }

        @PreAuthorize("hasRole('ADMINISTRADOR')")
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id){
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.noContent().build();
        }
    }