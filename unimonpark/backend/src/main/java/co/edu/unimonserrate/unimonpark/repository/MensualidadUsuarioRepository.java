package co.edu.unimonserrate.unimonpark.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import co.edu.unimonserrate.unimonpark.entity.MensualidadUsuario;
import co.edu.unimonserrate.unimonpark.enums.EstadoMensualidad;

public interface MensualidadUsuarioRepository extends JpaRepository<MensualidadUsuario, Long> {

    @Query("""
            select m from MensualidadUsuario m
            where m.usuario.idUsuario = :idUsuario
              and m.vehiculo.idVehiculo = :idVehiculo
              and m.estado = :estado
              and m.fechaInicio <= :fechaFin
              and m.fechaFin >= :fechaInicio
            """)
    List<MensualidadUsuario> buscarSolapadas(
            @Param("idUsuario") Long idUsuario,
            @Param("idVehiculo") Long idVehiculo,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin,
            @Param("estado") EstadoMensualidad estado);
}
