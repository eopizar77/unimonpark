package co.edu.unimonserrate.unimonpark.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

import co.edu.unimonserrate.unimonpark.enums.CategoriaPersona;
import co.edu.unimonserrate.unimonpark.enums.TipoCalculoTarifa;

@Entity
@Table(name = "tarifas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Tarifa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTarifa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_vehiculo", nullable = false)
    private TipoVehiculo tipoVehiculo;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "valor_hora", nullable = false)
    private BigDecimal valorHora;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria_persona", length = 35)
    private CategoriaPersona categoriaPersona;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_calculo", length = 20)
    private TipoCalculoTarifa tipoCalculo = TipoCalculoTarifa.POR_HORA;

    @Column(name = "horas_limite", precision = 4, scale = 2)
    private BigDecimal horasLimite;

    @Column(name = "valor_hasta_limite", precision = 10, scale = 2)
    private BigDecimal valorHastaLimite;

    @Column(name = "valor_despues_limite", precision = 10, scale = 2)
    private BigDecimal valorDespuesLimite;

    @Column(name = "porcentaje", precision = 5, scale = 2)
    private BigDecimal porcentaje;
}