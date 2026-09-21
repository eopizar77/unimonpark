package co.edu.unimonserrate.unimonpark.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;
import co.edu.unimonserrate.unimonpark.enums.EstadoPenalizacion;
import co.edu.unimonserrate.unimonpark.enums.TipoPenalizacion;

@Data @NoArgsConstructor @AllArgsConstructor
public class PenalizacionResponseDTO {
    private Long idPenalizacion;
    private Long idVehiculo;
    private String placaVehiculo;
    private TipoPenalizacion tipo;
    private BigDecimal valor;
    private EstadoPenalizacion estado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaPago;
    private String observaciones;
}