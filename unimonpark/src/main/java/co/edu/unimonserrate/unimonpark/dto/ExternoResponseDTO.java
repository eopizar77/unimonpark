package co.edu.unimonserrate.unimonpark.dto;

import java.time.LocalDateTime;
import co.edu.unimonserrate.unimonpark.enums.TipoDocumento;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ExternoResponseDTO {

    private Long idExterno;
    private TipoDocumento tipoDocumento;
    private String numeroDocumento;
    private String nombres;
    private String apellidos;
    private String telefono;
    private String correo;
    private String empresa;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
}