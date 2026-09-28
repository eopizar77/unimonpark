package co.edu.unimonserrate.unimonpark.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unimonserrate.unimonpark.dto.MensualidadRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.MensualidadResponseDTO;
import co.edu.unimonserrate.unimonpark.service.MensualidadUsuarioService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/mensualidades")
public class MensualidadUsuarioController {

    private final MensualidadUsuarioService mensualidadService;

    public MensualidadUsuarioController(MensualidadUsuarioService mensualidadService) {
        this.mensualidadService = mensualidadService;
    }

    @GetMapping
    public ResponseEntity<List<MensualidadResponseDTO>> listar() {
        return ResponseEntity.ok(mensualidadService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MensualidadResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(mensualidadService.buscarPorId(id));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTION')")
    @PostMapping
    public ResponseEntity<MensualidadResponseDTO> crear(@Valid @RequestBody MensualidadRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mensualidadService.crear(dto));
    }
}
