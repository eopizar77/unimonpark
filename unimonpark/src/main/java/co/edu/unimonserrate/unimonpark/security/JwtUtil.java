package co.edu.unimonserrate.unimonpark.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;


@Component
public class JwtUtil {
    
    /*private static final String SECRET ="";
    private static final long EXPIRACION_MS = 1000 * 60 * 60 * 8;

    private final Key key = Keys.hmacShaKeyFor (SECRET.getBytes());
    
    public String generarToken(String nombreUsuario, String rol){
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + EXPIRACION_MS);

        return Jwts.builder()
                .subject(nombreUsuario)
                .claim("rol", rol)
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(key)
                .compact();
    }

    public String extraerUsername(String token){
        return extraerClaims(token).getSubject();
    }

    public String extraerRol(String token){
        return extraerClaims(token).get("rol", String.class);
    }

    public boolean esTokenValido(String token, String nombreUsuario){
        String username = extraerUsername(token);
        return username.equals(nombreUsuario) && !esTokenExpirado(token);
    }*/

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expiracionMs;

    private SecretKey key;

    @jakarta.annotation.PostConstruct
    public void init(){
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generarToken(String nombreUsuario, String rol){
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + expiracionMs);

        return Jwts.builder()
                .subject(nombreUsuario)
                .claim("rol", rol)
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(key)
                .compact();
    }

    public String extraerUsername(String token){
        return extraerClaims(token).getSubject();
    }

    public String extraerRol(String token){
        return extraerClaims(token).get("rol", String.class);
    }

    public boolean esTokenValido(String token, String nombreUsuario){
        String username = extraerUsername(token);
        return username.equals(nombreUsuario)  &&  !esTokenExpirado(token);
    }

    private boolean esTokenExpirado(String token) {
        return extraerClaims(token).getExpiration().before(new Date());
    }

    private Claims extraerClaims(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey)key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}