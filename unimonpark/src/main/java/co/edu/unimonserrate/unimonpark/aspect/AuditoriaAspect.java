package co.edu.unimonserrate.unimonpark.aspect;

import java.time.LocalDateTime;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.fasterxml.jackson.databind.ObjectMapper;

import co.edu.unimonserrate.unimonpark.entity.Auditoria;
import co.edu.unimonserrate.unimonpark.entity.Usuario;
import co.edu.unimonserrate.unimonpark.repository.AuditoriaRepository;
import co.edu.unimonserrate.unimonpark.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;

@Aspect
@Component
public class AuditoriaAspect {

    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    public AuditoriaAspect(AuditoriaRepository auditoriaRepository,
                            UsuarioRepository usuarioRepository,
                            ObjectMapper objectMapper){
        this.auditoriaRepository = auditoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.objectMapper = objectMapper;
    }

    @Around("@annotation(auditable)")
    public Object registrarAuditoria(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable{

        Object resultado = joinPoint.proceed();

        try {
            String nombreUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
            Usuario usuario = usuarioRepository.findByNombreUsuario(nombreUsuario).orElse(null);

            Long registroId = extraerId(resultado);
            String datosNuevosJson = objectMapper.writeValueAsString(resultado);

            Auditoria auditoria = new Auditoria();
            auditoria.setUsuario(usuario);
            auditoria.setTablaAfectada(auditable.tabla());
            auditoria.setTipoOperacion(auditable.operacion());
            auditoria.setRegistroId(registroId);
            auditoria.setDatosNuevos(datosNuevosJson);
            auditoria.setFecha(LocalDateTime.now());
            auditoria.setIpOrigen(obtenerIp());

            auditoriaRepository.save(auditoria);
        } catch (Exception e){
            System.err.println("Error registrando auditoria: " + e.getMessage());
        }

        return resultado;

    }

    private Long extraerId(Object resultado){
        try{
            var metodo = resultado.getClass().getMethod("getId" + resultado.getClass().getSimpleName().replace("ResponseDTO", "").replace("DTO", ""));
            return (Long) metodo.invoke(resultado);
        } catch (Exception e){
            return null;
        }
    }

    private String obtenerIp(){
        try{
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            return request.getRemoteAddr();
        } catch (Exception e){
            return null;
        }
    }

}
