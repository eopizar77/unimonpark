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

import co.edu.unimonserrate.unimonpark.dto.TarifaRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.TarifaResponseDTO;
import co.edu.unimonserrate.unimonpark.service.TarifaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tarifas")
public class TarifaController {

    private final TarifaService tarifaService;

        public TarifaController(TarifaService tarifaService){
            this.tarifaService = tarifaService;
        }

        @GetMapping
        public ResponseEntity<List<TarifaResponseDTO>> listarTarifa(){
            return ResponseEntity.ok(tarifaService.listarTarifa());
        }

        @GetMapping("/{id}")
        public ResponseEntity<TarifaResponseDTO> buscarPorId(@PathVariable Long id){
            return ResponseEntity.ok(tarifaService.buscarPorId(id));
        }

        @PreAuthorize("hasRole('ADMINISTRADOR')")
        @PostMapping
        public ResponseEntity<TarifaResponseDTO> crearTarifa(@Valid @RequestBody TarifaRequestDTO tarifaDTO){
            TarifaResponseDTO tarifaCreada = tarifaService.crearTarifa(tarifaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(tarifaCreada);
        }

        @PreAuthorize("hasRole('ADMINISTRADOR')")
        @PutMapping("/{id}")
        public ResponseEntity<TarifaResponseDTO> actualizarTarifa(@PathVariable Long id, @Valid @RequestBody TarifaRequestDTO dto){
            return ResponseEntity.ok(tarifaService.actualizarTarifa(id, dto));
        }

        @PreAuthorize("hasRole('ADMINISTRADOR')")
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminarTarifa(@PathVariable Long id){
            tarifaService.eliminarTarifa(id);
            return ResponseEntity.noContent().build();
        }

}
