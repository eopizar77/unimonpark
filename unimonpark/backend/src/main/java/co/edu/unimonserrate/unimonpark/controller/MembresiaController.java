package co.edu.unimonserrate.unimonpark.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import co.edu.unimonserrate.unimonpark.dto.MembresiaRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.MembresiaResponseDTO;
import co.edu.unimonserrate.unimonpark.service.MembresiaService;

@RestController
@RequestMapping("/api/membresias")
public class MembresiaController {

    private final MembresiaService membresiaService;

    public MembresiaController(MembresiaService membresiaService) {
        this.membresiaService = membresiaService;
    }

    @GetMapping
    public ResponseEntity<List<MembresiaResponseDTO>> listar() {
        return ResponseEntity.ok(membresiaService.listarMembresias());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembresiaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(membresiaService.buscarPorId(id));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTION', 'SUPERVISOR')")
    @PostMapping
    public ResponseEntity<MembresiaResponseDTO> crear(@Valid @RequestBody MembresiaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(membresiaService.crearMembresia(dto));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTION', 'SUPERVISOR')")
    @PutMapping("/{id}")
    public ResponseEntity<MembresiaResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody MembresiaRequestDTO dto) {
        return ResponseEntity.ok(membresiaService.actualizarMembresia(id, dto));
    }
}
