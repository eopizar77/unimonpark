package co.edu.unimonserrate.unimonpark.security;

import co.edu.unimonserrate.unimonpark.aspect.AuditoriaAspect;

import co.edu.unimonserrate.unimonpark.repository.AuditoriaRepository;
import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;//
import org.springframework.security.core.context.SecurityContextHolder;//
import org.springframework.security.core.userdetails.UserDetails;//
import org.springframework.security.core.userdetails.UserDetailsService;//
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;//
import org.springframework.stereotype.Component;//
import org.springframework.web.filter.OncePerRequestFilter;//

import org.springframework.lang.NonNull;//
import jakarta.servlet.FilterChain;//
import jakarta.servlet.ServletException;//
import jakarta.servlet.http.HttpServletRequest;//
import jakarta.servlet.http.HttpServletResponse;//

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    
    
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService, AuditoriaAspect auditoriaAspect, AuditoriaRepository auditoriaRepository){
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }
    
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")){
            filterChain.doFilter(request, response);
            return;
        }

        try{

        String token = authHeader.substring(7);
        String nombreUsuario = jwtUtil.extraerUsername(token);

        if (nombreUsuario != null && SecurityContextHolder.getContext().getAuthentication() == null){
            UserDetails userDetails = userDetailsService.loadUserByUsername(nombreUsuario);

            if (jwtUtil.esTokenValido(token, userDetails.getUsername())){
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
    }   catch (Exception e){
        // Token invÃ¡lido, expirado o corrupto: simplemente no se autentica.
        // No se debe romper la peticion; el resto de la cadena de filtros.
        // decidirÃ¡ si la ruta requiere qutenticacion o no.
        System.err.println(">>> JWT FILTER ERROR: " + e.getClass().getName() + " - " + e.getMessage());
        e.printStackTrace();
        SecurityContextHolder.clearContext();
    }    

        filterChain.doFilter(request, response);
    }
}
