package co.edu.unimonserrate.unimonpark.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unimonserrate.unimonpark.dto.PagoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.PagoResponseDTO;
import co.edu.unimonserrate.unimonpark.service.PagoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pagos")

public class PagoController {
    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @GetMapping
    public ResponseEntity<List<PagoResponseDTO>> listarPagos() {
        return ResponseEntity.ok(pagoService.listarPagos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.buscarPorId(id));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTION')")
    @PostMapping
    public ResponseEntity<PagoResponseDTO> crearPagos(@Valid @RequestBody PagoRequestDTO dto) {
        PagoResponseDTO pagoCreado = pagoService.crearPagos(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoCreado);
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<PagoResponseDTO>> buscarPagos(
            @RequestParam(required = false) LocalDateTime desde,
            @RequestParam(required = false) LocalDateTime hasta,
            @RequestParam(required = false) String metodoPago,
            @RequestParam(required = false) String usuario) {
        return ResponseEntity.ok(pagoService.buscarPagos(desde, hasta, metodoPago, usuario));
    }
}
