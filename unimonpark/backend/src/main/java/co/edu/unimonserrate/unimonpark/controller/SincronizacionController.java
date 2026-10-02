package co.edu.unimonserrate.unimonpark.controller;

import co.edu.unimonserrate.unimonpark.dto.SincronizacionResponseDTO;
import co.edu.unimonserrate.unimonpark.service.SincronizacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sincronizacion")
public class SincronizacionController {

    @Autowired
    private SincronizacionService sincronizacionService;

    @GetMapping("/{documento}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTION')")
    public ResponseEntity<?> consultarPorDocumento(@PathVariable String documento) {
        try {
            SincronizacionResponseDTO response = sincronizacionService.buscarPersona(documento);
            if (response == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(java.util.Map.of("error", "Persona no encontrada en la base de datos institucional"));
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Error consultando base de datos institucional: " + e.getMessage()));
        }
    }
}
