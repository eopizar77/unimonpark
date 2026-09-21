package co.edu.unimonserrate.unimonpark.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import co.edu.unimonserrate.unimonpark.enums.TipoPenalizacion;

@Data @NoArgsConstructor @AllArgsConstructor
public class PenalizacionRequestDTO {
    @NotNull private Long idVehiculo;
    @NotNull private TipoPenalizacion tipo;
    private String observaciones;
}