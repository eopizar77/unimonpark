package co.edu.unimonserrate.unimonpark.dto;

import co.edu.unimonserrate.unimonpark.enums.EstadoEspacio;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EspacioParqueoResponseDTO {
    
    private Long idEspacio;
    private String codigo;
    private String piso;
    private String zona;
    private EstadoEspacio estado;
    private Boolean activo;
    private Long idTipoVehiculo;
    private String nombreTipoVehiculo;
}