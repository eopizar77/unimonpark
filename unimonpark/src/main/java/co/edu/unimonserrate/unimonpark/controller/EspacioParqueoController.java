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

import co.edu.unimonserrate.unimonpark.dto.EspacioParqueoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.EspacioParqueoResponseDTO;
import co.edu.unimonserrate.unimonpark.service.EspacioParqueoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/espacios-parqueo")

public class EspacioParqueoController {

    private final EspacioParqueoService espacioParqueoService;
    
        public EspacioParqueoController(EspacioParqueoService espacioParqueoService){
            this.espacioParqueoService = espacioParqueoService;
        }

        @GetMapping
        public ResponseEntity<List<EspacioParqueoResponseDTO>> listarEspacios(){
            return ResponseEntity.ok(espacioParqueoService.listarEspacioParqueo());
        }

        @GetMapping("/{id}")
        public ResponseEntity<EspacioParqueoResponseDTO> buscarPorId(@PathVariable Long id){
            return ResponseEntity.ok(espacioParqueoService.buscarPorId(id));
        }

        @PreAuthorize("hasRole('ADMINISTRADOR')")
        @PostMapping
        public ResponseEntity<EspacioParqueoResponseDTO> crearEspacioParqueo(@Valid @RequestBody EspacioParqueoRequestDTO espacioParqueoDTO){
            EspacioParqueoResponseDTO espacioParqueoCreado = espacioParqueoService.crearEspacioParqueo(espacioParqueoDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(espacioParqueoCreado);
        }

        @PreAuthorize("hasRole('ADMINISTRADOR')")
        @PutMapping("/{id}")
        public ResponseEntity<EspacioParqueoResponseDTO> actualizarEspacioParqueo(@PathVariable Long id, @Valid @RequestBody EspacioParqueoRequestDTO dto){
            return ResponseEntity.ok(espacioParqueoService.actualizarEspacioParqueo(id, dto));
        }

        @PreAuthorize("hasRole('ADMINISTRADOR')")
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminarEspacioParqueo(@PathVariable Long id){
            espacioParqueoService.eliminarEspacioParqueo(id);
            return ResponseEntity.noContent().build();
        }
}