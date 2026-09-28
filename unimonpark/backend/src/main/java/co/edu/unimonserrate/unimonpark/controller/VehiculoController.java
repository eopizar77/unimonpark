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

import co.edu.unimonserrate.unimonpark.dto.VehiculoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.VehiculoResponseDTO;
import co.edu.unimonserrate.unimonpark.service.VehiculoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vehiculos")

public class VehiculoController {
    
    private final VehiculoService vehiculoService;

        public VehiculoController(VehiculoService vehiculoService){
            this.vehiculoService = vehiculoService;
        }

        @GetMapping
        public ResponseEntity<List<VehiculoResponseDTO>> listarVehiculos(){
            return ResponseEntity.ok(vehiculoService.listarVehiculos());
        }

        @GetMapping("/{id}")
        public ResponseEntity<VehiculoResponseDTO> buscarPorId(@PathVariable Long id){
            return ResponseEntity.ok(vehiculoService.buscarPorId(id));
        }

        @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTION')")
        @PostMapping
        public ResponseEntity<VehiculoResponseDTO> crearVehiculo(@Valid @RequestBody VehiculoRequestDTO vehiculoDTO){
            VehiculoResponseDTO vehiculoCreado = vehiculoService.crearVehiculo(vehiculoDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(vehiculoCreado);
        }

        @PreAuthorize("hasRole('ADMINISTRADOR')")
        @PutMapping("/{id}")
        public ResponseEntity<VehiculoResponseDTO> actualizarVehiculo(@PathVariable Long id, @Valid @RequestBody VehiculoRequestDTO dto){
            return ResponseEntity.ok(vehiculoService.actualizarVehiculo(id, dto));
        }

        @PreAuthorize("hasRole('ADMINISTRADOR')")
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> eliminarVehiculo(@PathVariable Long id){
            vehiculoService.eliminarVehiculo(id);
            return ResponseEntity.noContent().build();
        }
}
