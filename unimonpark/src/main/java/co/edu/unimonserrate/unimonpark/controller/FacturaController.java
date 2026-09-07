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

import co.edu.unimonserrate.unimonpark.dto.FacturaRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.FacturaResponseDTO;
import co.edu.unimonserrate.unimonpark.service.FacturaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/facturas")

public class FacturaController {

    private final FacturaService facturaService;

    public FacturaController(FacturaService facturaService){
        this.facturaService = facturaService;
    }

    @GetMapping
    public ResponseEntity<List<FacturaResponseDTO>> listarFacturas(){
        return ResponseEntity.ok(facturaService.listarFacturas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacturaResponseDTO> buscarPorId(@PathVariable Long id){
        return ResponseEntity.ok(facturaService.buscarPorId(id));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTION')")
    @PostMapping
    public ResponseEntity<FacturaResponseDTO> crearFactura(@Valid @RequestBody FacturaRequestDTO dto){
        FacturaResponseDTO facturaCreada = facturaService.crearFactura(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(facturaCreada);
    }
    
}
