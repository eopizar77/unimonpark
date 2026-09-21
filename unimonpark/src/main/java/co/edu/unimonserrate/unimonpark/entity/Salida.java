package co.edu.unimonserrate.unimonpark.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import co.edu.unimonserrate.unimonpark.enums.TipoCalculoTarifa;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "salidas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Salida {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSalida;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ingreso", nullable = false, unique = true)
    private Ingreso ingreso;

    @Column(nullable = false)
    private LocalDateTime fechaSalida;

    private Integer lecturaFinalKm;

    @Column(nullable = false)
    private Long tiempoPermanencia;

    @Column(nullable = false)
    private BigDecimal valorTotal;

    private String observaciones;

    @Column(nullable = false, length = 20)
    private String estado;

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidad_pago", length = 30)
    private co.edu.unimonserrate.unimonpark.enums.ModalidadPago modalidadPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_calculo", length = 30)
    private TipoCalculoTarifa tipoCalculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tarifa", nullable = false)
    private Tarifa tarifa;
}
