package co.edu.unimonserrate.unimonpark.dto;


import co.edu.unimonserrate.unimonpark.enums.EstadoIngreso;
import co.edu.unimonserrate.unimonpark.enums.TipoIngreso;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngresoRequestDTO {

    private Integer lecturaInicialKm;

    @NotNull(message = "El tipo de ingreso es obligatorio")
    private TipoIngreso tipoIngreso;

    @NotNull(message = "El estado es obligatorio")
    private EstadoIngreso estado;

    @NotNull(message = "El campo Tipo de Vehiculo es obligatorio")
    private Long idVehiculo;

    @NotNull(message = "El campo Espacio de Parqueo es obligatorio")
    private Long idEspacioParqueo;

    private String numeroFicha;
}
