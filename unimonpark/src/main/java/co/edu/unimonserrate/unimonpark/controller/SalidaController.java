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

import co.edu.unimonserrate.unimonpark.dto.SalidaRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.SalidaResponseDTO;
import co.edu.unimonserrate.unimonpark.service.SalidaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/salidas")
public class SalidaController {

    private final SalidaService salidaService;

    public SalidaController(SalidaService salidaService){
        this.salidaService = salidaService;
    }

    @GetMapping
    public ResponseEntity<List<SalidaResponseDTO>> listarSalidas(){
        return ResponseEntity.ok(salidaService.listarSalidas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalidaResponseDTO> buscarPorId(@PathVariable Long id){
        return ResponseEntity.ok(salidaService.buscarPorId(id));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTION')")
    @PostMapping
    public ResponseEntity<SalidaResponseDTO> crearSalida(@Valid @RequestBody SalidaRequestDTO dto){
        SalidaResponseDTO salidaCreada = salidaService.crearSalida(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(salidaCreada);
    }
   
}