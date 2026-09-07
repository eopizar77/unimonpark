package co.edu.unimonserrate.unimonpark.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class TarifaRequestDTO {

    @NotNull(message = "El nombre es obligatorio")
    private String nombre;

    @NotNull(message = "El valor de la hora no puede ser un dato nulo")
    private BigDecimal valorHora;

    @NotNull(message = "El campo es obligatorio")
    private Boolean activo;

    @NotNull(message = "El campo tipo de vehiculo es obligatorio")
    private Long idTipoVehiculo;
      
}
