package co.edu.unimonserrate.unimonpark.service.impl;

import co.edu.unimonserrate.unimonpark.dto.SincronizacionResponseDTO;
import co.edu.unimonserrate.unimonpark.service.SincronizacionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Map;

@Service
public class SincronizacionServiceImpl implements SincronizacionService {

    @Value("${ext.datasource.url:}")
    private String extUrl;

    @Value("${ext.datasource.username:}")
    private String extUsername;

    @Value("${ext.datasource.password:}")
    private String extPassword;

    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        if (extUrl != null && !extUrl.isEmpty()) {
            DriverManagerDataSource dataSource = new DriverManagerDataSource();
            dataSource.setDriverClassName("org.postgresql.Driver");
            dataSource.setUrl(extUrl);
            dataSource.setUsername(extUsername);
            dataSource.setPassword(extPassword);
            this.jdbcTemplate = new JdbcTemplate(dataSource);
        }
    }

    @Override
    public SincronizacionResponseDTO buscarPersona(String documento) {
        if (this.jdbcTemplate == null) {
            throw new RuntimeException("La base de datos externa no está configurada.");
        }

        String sql = "SELECT documento, nombres, apellidos, email_institucional, email_personal, rol, estado FROM public.users WHERE documento = ?";
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, documento);

        if (rows.isEmpty()) {
            return null; // No encontrado
        }

        Map<String, Object> persona = rows.get(0);
        SincronizacionResponseDTO dto = new SincronizacionResponseDTO();

        dto.setDocumento((String) persona.get("documento"));
        dto.setNombres((String) persona.get("nombres"));
        dto.setApellidos((String) persona.get("apellidos"));

        String emailInst = (String) persona.get("email_institucional");
        String emailPers = (String) persona.get("email_personal");
        dto.setCorreo(emailInst != null && !emailInst.trim().isEmpty() ? emailInst : emailPers);

        String estado = (String) persona.get("estado");
        dto.setActivo(estado != null && estado.equalsIgnoreCase("activo"));

        String rol = (String) persona.get("rol");
        dto.setRolOriginal(rol);

        long idRolAsignado = -1;
        boolean esExterno = false;

        if (rol != null) {
            String rolLower = rol.toLowerCase();
            if (rolLower.contains("estudiante") || rolLower.contains("egresado")) {
                idRolAsignado = 7L;
            } else if (rolLower.contains("docente") || rolLower.contains("administrativo")) {
                idRolAsignado = 8L;
            } else if (rolLower.contains("tercero")) {
                esExterno = true;
            } else {
                esExterno = true;
            }
        } else {
            esExterno = true;
        }

        dto.setIdRol(idRolAsignado != -1 ? idRolAsignado : null);
        dto.setEsExterno(esExterno);

        return dto;
    }
}
