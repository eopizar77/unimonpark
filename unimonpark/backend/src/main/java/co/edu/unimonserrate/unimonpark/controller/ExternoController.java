package co.edu.unimonserrate.unimonpark.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import co.edu.unimonserrate.unimonpark.dto.ExternoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.ExternoResponseDTO;
import co.edu.unimonserrate.unimonpark.service.ExternoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/externos")
public class ExternoController {

    private final ExternoService externoService;

    public ExternoController(ExternoService externoService) {
        this.externoService = externoService;
    }

    @GetMapping
    public ResponseEntity<List<ExternoResponseDTO>> listarExternos() {
        return ResponseEntity.ok(externoService.listarExternos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExternoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(externoService.buscarPorId(id));
    }

    @GetMapping("/documento/{documento}")
    public ResponseEntity<ExternoResponseDTO> buscarPorDocumento(@PathVariable String documento) {
        return ResponseEntity.ok(externoService.buscarPorDocumento(documento));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTION')")
    @PostMapping
    public ResponseEntity<ExternoResponseDTO> crearExterno(@Valid @RequestBody ExternoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(externoService.crearExterno(dto));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTION')")
    @PutMapping("/{id}")
    public ResponseEntity<ExternoResponseDTO> actualizarExterno(@PathVariable Long id, @Valid @RequestBody ExternoRequestDTO dto) {
        return ResponseEntity.ok(externoService.actualizarExterno(id, dto));
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarExterno(@PathVariable Long id) {
        externoService.eliminarExterno(id);
        return ResponseEntity.noContent().build();
    }
}