package co.edu.unimonserrate.unimonpark.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRequestDTO {
    
    @NotBlank(message = "Informacion de nombres es obligatorio")
    private String nombres;

    @NotBlank(message = "Informacion de apellidos es obligatorio")
    private String apellidos;

    @NotBlank(message = "Informacion de documento es obligatoria")
    private String documento;

    @NotBlank(message = "Informacion de correo electronico es obligatoria")
    @Email(message = "El correo digitado no tiene un formato valido")
    private String correo;

    private String telefono;

    @NotBlank(message = "El nombre de usuario es obligarotio")
    private String nombreUsuario;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String contrasena;

    @NotNull(message = "El rol es obligatorio")
    private Long idRol;

    private Long idPerfilUsuarioTarifa;

    private Boolean voluntarioCentroObrero = false;

    @NotNull(message = "el campo activo es obligatorio")
    private Boolean activo;
}
