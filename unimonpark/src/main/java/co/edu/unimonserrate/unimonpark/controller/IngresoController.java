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

import co.edu.unimonserrate.unimonpark.dto.IngresoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.IngresoResponseDTO;
import co.edu.unimonserrate.unimonpark.service.IngresoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ingresos")
public class IngresoController {

        private final IngresoService ingresoService;

        public IngresoController(IngresoService ingresoService){
            this.ingresoService = ingresoService;
    }

    @GetMapping
    public ResponseEntity<List<IngresoResponseDTO>> listarIngreso(){
        return ResponseEntity.ok(ingresoService.listarIngreso());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IngresoResponseDTO> buscarPorId(@PathVariable Long id){
        return ResponseEntity.ok(ingresoService.buscarPorId(id));
    }

    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTION', 'SUPERVISOR')")
    @PostMapping
    public ResponseEntity<IngresoResponseDTO> crearIngreso(@Valid @RequestBody IngresoRequestDTO ingresoDTO){
        IngresoResponseDTO ingresoCreado = ingresoService.crearIngreso(ingresoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(ingresoCreado);
    }

    /*@DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarIngreso(@PathVariable Long id){
        ingresoService.eliminarIngreso(id);
        return ResponseEntity.noContent().build();
    }*/
}