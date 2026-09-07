package co.edu.unimonserrate.unimonpark.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalidaResponseDTO {
    
    private Long idSalida;
    private Long idIngreso;
    private String placaVehiculo;
    private LocalDateTime fechaIngreso;
    private LocalDateTime fechaSalida;
    private Integer lecturaFinalKm;
    private Long tiempoPermanencia;
    private BigDecimal valorTotal;
    private String observaciones;
    private String estado;
    private Long idTarifa;
    private String nombreTarifa;
}