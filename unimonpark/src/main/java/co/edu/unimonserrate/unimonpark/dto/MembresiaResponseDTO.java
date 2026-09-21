package co.edu.unimonserrate.unimonpark.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class MembresiaResponseDTO {
    private Long idMembresia;
    private Long idVehiculo;
    private String placaVehiculo;
    private Long idTarifa;
    private String nombreTarifa;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private BigDecimal montoPagado;
    private boolean activa;
}