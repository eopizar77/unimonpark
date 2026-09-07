package co.edu.unimonserrate.unimonpark.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
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
@Table(name = "auditoria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Auditoria {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long IdLog;
   
   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "id_usuario", nullable = false)
   private Usuario usuario;

   @Column(name = "tabla_afectada", nullable = false, length = 50)
   private String tablaAfectada;

   @Enumerated(EnumType.STRING)
   @Column(name = "tipo_operacion", nullable = false, length = 20)
   private TipoOperacion tipoOperacion;

   @Column(name = "registro_id", nullable = false)
   private Long registroId;

   @JdbcTypeCode(SqlTypes.JSON)
   @Column(name = "datos_anteriores", columnDefinition = "jsonb")
   private String datosAnteriores;

   @JdbcTypeCode(SqlTypes.JSON)
   @Column(name = "datos_nuevos", columnDefinition = "jsonb")
   private String datosNuevos;

   @Column(nullable = false)
   private LocalDateTime fecha;

   @Column(name = "ip_origen", length = 45)
   private String ipOrigen;
}
