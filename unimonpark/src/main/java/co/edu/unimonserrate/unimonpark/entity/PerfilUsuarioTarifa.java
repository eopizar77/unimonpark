package co.edu.unimonserrate.unimonpark.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "perfiles_usuario_tarifa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PerfilUsuarioTarifa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPerfilUsuarioTarifa;

    @Column(nullable = false, unique = true, length = 80)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(nullable = false)
    private Boolean activo = true;
}
