package co.edu.unimonserrate.unimonpark.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unimonserrate.unimonpark.dto.LoginRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.LoginResponseDTO;
import co.edu.unimonserrate.unimonpark.security.JwtUtil;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationConfiguration authenticationConfiguration, JwtUtil jwtUtil){
        this.authenticationConfiguration = authenticationConfiguration;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO dto) throws Exception{
        try {
            AuthenticationManager authenticationManager = authenticationConfiguration.getAuthenticationManager();

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getNombreUsuario(), dto.getContrasena())
        );
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String rol = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        String token = jwtUtil.generarToken(userDetails.getUsername(), rol);

        LoginResponseDTO respuesta = new LoginResponseDTO(token, userDetails.getUsername(), rol);
        return ResponseEntity.ok(respuesta);

        } catch (AuthenticationException e){
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.UNAUTHORIZED.value());
        body.put("error", "Credenciales inválidas");
        body.put("mensaje", "El nombre de usuario o contraseña son incorrectos");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }
    }
}