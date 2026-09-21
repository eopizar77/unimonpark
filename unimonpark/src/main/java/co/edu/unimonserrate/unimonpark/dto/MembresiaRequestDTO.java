package co.edu.unimonserrate.unimonpark.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class MembresiaRequestDTO {
    @NotNull private Long idVehiculo;
    @NotNull private Long idTarifa;
}