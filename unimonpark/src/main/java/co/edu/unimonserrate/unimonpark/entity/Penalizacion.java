package co.edu.unimonserrate.unimonpark.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

import co.edu.unimonserrate.unimonpark.enums.EstadoPenalizacion;
import co.edu.unimonserrate.unimonpark.enums.TipoPenalizacion;

@Entity
@Table(name = "penalizaciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Penalizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPenalizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vehiculo", nullable = false)
    private Vehiculo vehiculo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoPenalizacion tipo;

    @Column(nullable = false)
    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPenalizacion estado;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    private String observaciones;
}