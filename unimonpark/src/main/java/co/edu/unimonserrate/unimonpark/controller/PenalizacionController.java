package co.edu.unimonserrate.unimonpark.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import co.edu.unimonserrate.unimonpark.dto.PenalizacionRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.PenalizacionResponseDTO;
import co.edu.unimonserrate.unimonpark.service.PenalizacionService;

@RestController
@RequestMapping("/api/penalizaciones")
public class PenalizacionController {

    private final PenalizacionService penalizacionService;

    public PenalizacionController(PenalizacionService penalizacionService) {
        this.penalizacionService = penalizacionService;
    }

    @GetMapping
    public ResponseEntity<List<PenalizacionResponseDTO>> listar() {
        return ResponseEntity.ok(penalizacionService.listarPenalizaciones());
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTION')")
    @PostMapping
    public ResponseEntity<PenalizacionResponseDTO> crear(@Valid @RequestBody PenalizacionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(penalizacionService.crearPenalizacion(dto));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTION', 'SUPERVISOR')")
    @PutMapping("/{id}/pagar")
    public ResponseEntity<PenalizacionResponseDTO> marcarPagada(@PathVariable Long id) {
        return ResponseEntity.ok(penalizacionService.marcarComoPagada(id));
    }
}