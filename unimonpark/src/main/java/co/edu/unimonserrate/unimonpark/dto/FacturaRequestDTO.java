package co.edu.unimonserrate.unimonpark.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class FacturaRequestDTO {

    @NotNull(message = "La salida a facturar es obligatoria")
    private Long idSalida;

    private Long idUsuario;
    
    private Long idExterno;

    @DecimalMin(value = "0.0", message = "El descuento no puede ser negativo")
    private BigDecimal descuento;

    @DecimalMin(value = "0.0", message = "El IVA no puede ser negativo")
    private BigDecimal iva;

}
