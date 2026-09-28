package co.edu.unimonserrate.unimonpark.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import co.edu.unimonserrate.unimonpark.enums.CategoriaPersona;
import co.edu.unimonserrate.unimonpark.enums.TipoCalculoTarifa;
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
    private BigDecimal valorDiurno;
    private BigDecimal valorNocturno;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaInicioNocturna;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaFinNocturna;

    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private Long idTipoVehiculo;
    private String nombreTipoVehiculo;

    private CategoriaPersona categoriaPersona;
    private TipoCalculoTarifa tipoCalculo;
    private BigDecimal horasLimite;
    private BigDecimal valorHastaLimite;
    private BigDecimal valorDespuesLimite;
    private BigDecimal porcentaje;
}
