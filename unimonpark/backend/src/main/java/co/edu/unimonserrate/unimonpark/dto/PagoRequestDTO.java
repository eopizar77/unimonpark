package co.edu.unimonserrate.unimonpark.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class PagoRequestDTO {

    @NotNull(message = "La factura no debe ir en vacio")
    private Long idFactura;

    @NotBlank(message = "El metodo de pago es obligatorio")
    private String metodoPago;

    private String referencia;
}
