package co.edu.unimonserrate.unimonpark.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarifaResponseDTO {
    
    private Long idTarifa;
    private String nombre;
    private BigDecimal valorHora;
    private Boolean activo;
    private Long idTipoVehiculo;
    private String nombreTipoVehiculo;
}
