package co.edu.unimonserrate.unimonpark.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequestDTO {
    @NotBlank
    private String token;
    
    @NotBlank
    private String nuevaContrasena;
}
