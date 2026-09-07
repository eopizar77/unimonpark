package co.edu.unimonserrate.unimonpark.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehiculoRequestDTO {

    @NotBlank(message = "Informacion de placa es obligatoria")
    private String placa;

    @NotBlank(message = "Informacion de marca es obligatoria")
    private String marca;

    @NotBlank(message = "Informacion de modelo es obligatoria")
    private String modelo;

    @NotBlank(message = "Informacion de color de vehiculo es obligatoria")
    private String color;

    @NotNull(message = "Tipo de Vehiculo no puede ir vacio")
    private Long idTipoVehiculo;

    @NotNull(message = "El usuario es obligatorio")
    private Long idUsuario;

    @NotNull(message = "El campo activo es obligatorio")
    private Boolean activo;
    
}
