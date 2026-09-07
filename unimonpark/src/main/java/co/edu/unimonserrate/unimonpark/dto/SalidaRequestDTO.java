package co.edu.unimonserrate.unimonpark.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class SalidaRequestDTO {
    
  private Integer lecturaFinalKm;

  private String observaciones;

  @NotNull(message = "El identificador del vehiculo no puede quedar vacio")
  private Long idIngreso;

  @NotNull(message = "El identificador de la tarifa debe ser registrado")
  private Long idTarifa;

}
