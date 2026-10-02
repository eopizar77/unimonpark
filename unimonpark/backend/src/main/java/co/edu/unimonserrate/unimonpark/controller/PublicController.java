package co.edu.unimonserrate.unimonpark.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import co.edu.unimonserrate.unimonpark.dto.RegistroPublicoDTO;
import co.edu.unimonserrate.unimonpark.dto.SincronizacionResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.Usuario;
import co.edu.unimonserrate.unimonpark.entity.Vehiculo;
import co.edu.unimonserrate.unimonpark.entity.Rol;
import co.edu.unimonserrate.unimonpark.entity.TipoVehiculo;
import co.edu.unimonserrate.unimonpark.repository.UsuarioRepository;
import co.edu.unimonserrate.unimonpark.repository.VehiculoRepository;
import co.edu.unimonserrate.unimonpark.repository.RolRepository;
import co.edu.unimonserrate.unimonpark.repository.TipoVehiculoRepository;
import co.edu.unimonserrate.unimonpark.service.SincronizacionService;

import java.util.Optional;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private SincronizacionService sincronizacionService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private VehiculoRepository vehiculoRepository;
    
    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private TipoVehiculoRepository tipoVehiculoRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/sincronizar/{documento}")
    public ResponseEntity<?> sincronizarPorDocumento(@PathVariable String documento) {
        try {
            SincronizacionResponseDTO response = sincronizacionService.buscarPersona(documento);
            if (response == null) {
                return ResponseEntity.status(404).body(java.util.Map.of("error", "Persona no encontrada en la BD de la Universidad"));
            }
            if (response.getEsExterno()) {
                return ResponseEntity.status(400).body(java.util.Map.of("error", "Los terceros o externos no pueden usar el autoservicio."));
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/registro-vehiculo")
    public ResponseEntity<?> registrarVehiculo(@RequestBody RegistroPublicoDTO dto) {
        try {
            // 1. Verificar si el usuario existe, si no, crearlo
            Usuario usuario = usuarioRepository.findByDocumento(dto.getDocumento()).orElse(null);
            
            if (usuario == null) {
                usuario = new Usuario();
                usuario.setDocumento(dto.getDocumento());
                usuario.setNombres(dto.getNombres());
                usuario.setApellidos(dto.getApellidos());
                usuario.setCorreo(dto.getCorreo());
                usuario.setNombreUsuario(dto.getDocumento());
                usuario.setContrasenaHash(passwordEncoder.encode(dto.getDocumento())); // Default password
                usuario.setActivo(true);
                
                Rol rol = rolRepository.findById(dto.getIdRol())
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
                usuario.setRol(rol);
                
                usuario = usuarioRepository.save(usuario);
            }
            
            // 2. Crear vehÃ­culo
            TipoVehiculo tipo = tipoVehiculoRepository.findById(dto.getTipoVehiculoId())
                    .orElseThrow(() -> new RuntimeException("Tipo de vehÃ­culo no encontrado"));
                    
            Vehiculo vehiculo = new Vehiculo();
            vehiculo.setPlaca(dto.getPlaca() != null ? dto.getPlaca() : "N/A");
            vehiculo.setMarca(dto.getMarca());
            vehiculo.setModelo(dto.getModelo());
            vehiculo.setColor(dto.getColor());
            vehiculo.setUsuario(usuario);
            vehiculo.setTipoVehiculo(tipo);
            vehiculo.setActivo(true);
            
            vehiculoRepository.save(vehiculo);
            
            return ResponseEntity.ok(java.util.Map.of("mensaje", "VehÃ­culo registrado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Error registrando vehÃ­culo: " + e.getMessage()));
        }
    }
}
