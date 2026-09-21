package co.edu.unimonserrate.unimonpark.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import co.edu.unimonserrate.unimonpark.enums.EstadoMensualidad;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MensualidadResponseDTO {

    private Long idMensualidadUsuario;
    private Long idUsuario;
    private Long idVehiculo;
    private String placaVehiculo;
    private Long idTarifa;
    private String nombreTarifa;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private BigDecimal valorCalculado;
    private EstadoMensualidad estado;
    private LocalDateTime fechaCreacion;
}
