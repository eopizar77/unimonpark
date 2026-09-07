package co.edu.unimonserrate.unimonpark.entity;

import co.edu.unimonserrate.unimonpark.enums.EstadoEspacio;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "espacios_parqueo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class EspacioParqueo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEspacio;

    @Column(unique = true, nullable = false)
    private String codigo;

    private String piso;

    private String zona;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoEspacio estado;

    @Column(nullable = false)
    private Boolean activo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_vehiculo", nullable = false)
    private TipoVehiculo tipoVehiculo;
}