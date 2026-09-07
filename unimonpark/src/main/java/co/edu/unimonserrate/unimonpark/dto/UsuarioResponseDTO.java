package co.edu.unimonserrate.unimonpark.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {

    private Long idUsuario;
    private String nombres;
    private String apellidos;
    private String documento;
    private String correo;
    private String telefono;
    private String nombreUsuario;
    private Long idRol;
    private String nombreRol;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;    
}
