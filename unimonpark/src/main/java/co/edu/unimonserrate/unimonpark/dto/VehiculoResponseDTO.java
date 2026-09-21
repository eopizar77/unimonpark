package co.edu.unimonserrate.unimonpark.dto;

import java.time.LocalDateTime;

import co.edu.unimonserrate.unimonpark.enums.CategoriaPersona;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class VehiculoResponseDTO {
    
    private Long idVehiculo;
    private String placa;
    private String marca;
    private String modelo;
    private String color;
    private Long idTipoVehiculo;
    private String nombreTipoVehiculo;
    private Long idUsuario;
    private String nombreUsuario;
    private Boolean activo;
    private CategoriaPersona categoriaPersona;
    private LocalDateTime fechaCreacion;
}
