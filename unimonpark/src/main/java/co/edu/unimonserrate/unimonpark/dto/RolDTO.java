package co.edu.unimonserrate.unimonpark.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor

public class RolDTO {

    private Long idRol;

    @NotBlank(message = "El nombre del rol es obligatorio")
    @Size(max = 50, message = "El nombre no puede superar los 50 caracteres")
    private String nombre;

    @Size(max = 150, message = "La descripcion del rol no puede superar los 150 caracteres")
    private String descripcion;

    @NotNull(message = "El campo activo es obligatorio")
    private Boolean activo;
}