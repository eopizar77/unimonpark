package co.edu.unimonserrate.unimonpark.dto;

import co.edu.unimonserrate.unimonpark.enums.EstadoEspacio;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EspacioParqueoRequestDTO {

    @NotBlank(message = "El codigo es obligatorio")
    private String codigo;

    private String piso;

    private String zona;

    @NotNull(message = "Informacion de estado es obligatorio")
    private EstadoEspacio estado;

    @NotNull(message = "El campo es obligatorio")
    private Boolean activo;

    @NotNull(message = "El campo de tipo de vehiculo es obligatorio")
    private Long idTipoVehiculo;
}