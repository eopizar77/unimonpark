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

import co.edu.unimonserrate.unimonpark.dto.TipoVehiculoDTO;
import co.edu.unimonserrate.unimonpark.service.TipoVehiculoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tipos-vehiculo")

public class TipoVehiculoController {
    
    private final TipoVehiculoService tipoVehiculoService;

    public TipoVehiculoController(TipoVehiculoService tipovehiculoservice){
        this.tipoVehiculoService = tipovehiculoservice;
    }

    @GetMapping
    public ResponseEntity<List<TipoVehiculoDTO>> listarTipoVehiculo(){
        List<TipoVehiculoDTO> tipos_vehiculo = tipoVehiculoService.listarTipoVehiculo();
        return ResponseEntity.ok(tipos_vehiculo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoVehiculoDTO> buscarPorId(@PathVariable Long id){
        TipoVehiculoDTO tipoVehiculo = tipoVehiculoService.buscarPorId(id);
        return ResponseEntity.ok(tipoVehiculo);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping
    public ResponseEntity<TipoVehiculoDTO> crearTipoVehiculo(@Valid @RequestBody TipoVehiculoDTO tipoVehiculoDTO){
        TipoVehiculoDTO tipoVehiculocreado = tipoVehiculoService.guardarTipoVehiculo(tipoVehiculoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(tipoVehiculocreado);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/{id}")
    public ResponseEntity<TipoVehiculoDTO> actualizarTipoVehiculo(@PathVariable Long id, @Valid @RequestBody TipoVehiculoDTO tipoVehiculoDTO){
        tipoVehiculoDTO.setIdTipoVehiculo(id);
        TipoVehiculoDTO tipoVehiculoActualizado = tipoVehiculoService.guardarTipoVehiculo(tipoVehiculoDTO);
        return ResponseEntity.ok(tipoVehiculoActualizado);
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTipoVehiculo(@PathVariable Long id){
        tipoVehiculoService.eliminarTipoVehiculo(id);
        return ResponseEntity.noContent().build();
    }
}
