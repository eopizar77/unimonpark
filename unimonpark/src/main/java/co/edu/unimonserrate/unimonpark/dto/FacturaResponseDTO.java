package co.edu.unimonserrate.unimonpark.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import co.edu.unimonserrate.unimonpark.enums.EstadoFactura;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacturaResponseDTO {

    private Long idFactura;
    private Long idUsuario;
    private String nombres;
    private String apellidos;
    private LocalDateTime fecha;
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal iva;
    private BigDecimal total;
    private EstadoFactura estado;
    private Long idSalida;
    private String placaVehiculo;
    private String tipoVehiculo;
    private Long idTarifa;
    private String nombreTarifa;
    private String categoriaPersona;
}