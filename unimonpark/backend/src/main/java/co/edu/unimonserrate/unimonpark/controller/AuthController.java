package co.edu.unimonserrate.unimonpark.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import co.edu.unimonserrate.unimonpark.dto.LoginRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.LoginResponseDTO;
import co.edu.unimonserrate.unimonpark.dto.ForgotPasswordRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.ResetPasswordRequestDTO;
import co.edu.unimonserrate.unimonpark.entity.PasswordResetToken;
import co.edu.unimonserrate.unimonpark.entity.Usuario;
import co.edu.unimonserrate.unimonpark.repository.PasswordResetTokenRepository;
import co.edu.unimonserrate.unimonpark.repository.UsuarioRepository;
import co.edu.unimonserrate.unimonpark.security.JwtUtil;
import co.edu.unimonserrate.unimonpark.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final JwtUtil jwtUtil;
    
    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationConfiguration authenticationConfiguration, JwtUtil jwtUtil, UsuarioRepository usuarioRepository, PasswordResetTokenRepository tokenRepository, EmailService emailService, PasswordEncoder passwordEncoder){
        this.authenticationConfiguration = authenticationConfiguration;
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO dto) throws Exception {
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
            body.put("error", "Credenciales invalidas");
            body.put("mensaje", "El nombre de usuario o contrasena son incorrectos");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
        }
    }

    @Transactional
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO dto) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(dto.getCorreo());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("mensaje", "Si el correo existe, se ha enviado un enlace."));
        }

        Usuario usuario = usuarioOpt.get();
        String tokenStr = UUID.randomUUID().toString();
        
        PasswordResetToken token = tokenRepository.findByUsuario(usuario).orElse(new PasswordResetToken());
        token.setToken(tokenStr);
        token.setUsuario(usuario);
        token.setExpiryDate(LocalDateTime.now().plusMinutes(30));
        tokenRepository.save(token);

        String resetLink = "http://localhost:5173/reset-password?token=" + tokenStr;
        String emailBody = "Para restablecer tu contrasena, haz clic en el siguiente enlace:\n" + resetLink;

        try {
            emailService.sendSimpleMessage(usuario.getCorreo(), "Restablecimiento de Contrasena - Unimonpark", emailBody);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error al enviar el correo."));
        }

        return ResponseEntity.ok(Map.of("mensaje", "Si el correo existe, se ha enviado un enlace."));
    }

    @Transactional
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO dto) {
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(dto.getToken());
        if (tokenOpt.isEmpty() || tokenOpt.get().isExpired()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Token invalido o expirado."));
        }

        Usuario usuario = tokenOpt.get().getUsuario();
        usuario.setContrasenaHash(passwordEncoder.encode(dto.getNuevaContrasena()));
        usuarioRepository.save(usuario);
        
        tokenRepository.delete(tokenOpt.get());

        return ResponseEntity.ok(Map.of("mensaje", "Contrasena actualizada correctamente."));
    }
}



