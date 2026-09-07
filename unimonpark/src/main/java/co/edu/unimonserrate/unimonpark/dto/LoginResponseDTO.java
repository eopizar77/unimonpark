package co.edu.unimonserrate.unimonpark.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    
    private String token;
    private String nombreUsuario;
    private String rol;
}
