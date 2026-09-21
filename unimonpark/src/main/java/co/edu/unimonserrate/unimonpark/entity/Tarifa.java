package co.edu.unimonserrate.unimonpark.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import co.edu.unimonserrate.unimonpark.enums.ModalidadPago;
import co.edu.unimonserrate.unimonpark.enums.TipoValor;

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

    @Column(nullable = false)
    private String nombre;

    @Column(name = "valor_hora")
    private BigDecimal valorHora;

    @Column(precision = 12, scale = 2)
    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidad_pago", length = 30)
    private ModalidadPago modalidadPago;

    @Column(length = 80)
    private String concepto;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_valor", length = 20)
    private TipoValor tipoValor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_perfil_usuario_tarifa")
    private PerfilUsuarioTarifa perfilUsuarioTarifa;

    @Column(nullable = false)
    private Boolean activo;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_vehiculo")
    private TipoVehiculo tipoVehiculo;
}