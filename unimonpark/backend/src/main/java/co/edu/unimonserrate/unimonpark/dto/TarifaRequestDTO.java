package co.edu.unimonserrate.unimonpark.dto;

import java.math.BigDecimal;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import co.edu.unimonserrate.unimonpark.enums.CategoriaPersona;
import co.edu.unimonserrate.unimonpark.enums.TipoCalculoTarifa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarifaRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotNull(message = "El valor de la hora no puede ser un dato nulo")
    private BigDecimal valorHora;

    private BigDecimal valorDiurno;

    private BigDecimal valorNocturno;

    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime horaInicioNocturna;

    @JsonFormat(pattern = "HH:mm[:ss]")
    private LocalTime horaFinNocturna;

    @NotNull(message = "El campo activo es obligatorio")
    private Boolean activo;

    @NotNull(message = "El campo tipo de vehiculo es obligatorio")
    private Long idTipoVehiculo;

    private CategoriaPersona categoriaPersona;

    private TipoCalculoTarifa tipoCalculo;

    private BigDecimal horasLimite;
    private BigDecimal valorHastaLimite;
    private BigDecimal valorDespuesLimite;
    private BigDecimal porcentaje;
}
