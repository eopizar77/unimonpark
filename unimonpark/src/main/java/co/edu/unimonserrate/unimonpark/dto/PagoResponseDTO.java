package co.edu.unimonserrate.unimonpark.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import co.edu.unimonserrate.unimonpark.enums.EstadoPago;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagoResponseDTO {
    
    private Long idPago;
    private Long idFactura;
    private LocalDateTime fecha;
    private BigDecimal monto;
    private String metodoPago;
    private String referencia;
    private EstadoPago estado;
}