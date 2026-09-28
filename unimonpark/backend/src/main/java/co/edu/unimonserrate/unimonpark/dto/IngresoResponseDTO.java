package co.edu.unimonserrate.unimonpark.dto;

import java.time.LocalDateTime;

import co.edu.unimonserrate.unimonpark.enums.EstadoIngreso;
import co.edu.unimonserrate.unimonpark.enums.TipoIngreso;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngresoResponseDTO {

    private Long idIngreso;
    private LocalDateTime fechaIngreso;
    private Integer lecturaInicialKm;
    private TipoIngreso tipoIngreso;
    private EstadoIngreso estado;
    private Long idVehiculo;
    private String placaVehiculo;
    private Long idEspacioParqueo;
    private String codigoEspacioParqueo;
    private String numeroFicha;
}