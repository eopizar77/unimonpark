package co.edu.unimonserrate.unimonpark.entity;

import java.time.LocalDateTime;

import co.edu.unimonserrate.unimonpark.enums.EstadoIngreso;
import co.edu.unimonserrate.unimonpark.enums.TipoIngreso;
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
@Table(name = "ingresos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor


public class Ingreso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idIngreso;

    @Column(nullable = false)
    private LocalDateTime fechaIngreso;

    private Integer lecturaInicialKm;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 255)
    private TipoIngreso tipoIngreso;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoIngreso estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vehiculo", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_espacio_parqueo", nullable = false)
    private EspacioParqueo espacioParqueo;

    @Column(name = "numero_ficha", length = 20)
    private String numeroFicha;
}
