package co.edu.unimonserrate.unimonpark.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import co.edu.unimonserrate.unimonpark.entity.SalarioUsuario;

public interface SalarioUsuarioRepository extends JpaRepository<SalarioUsuario, Long> {

    @Query("""
	    select s from SalarioUsuario s
	    where s.usuario.idUsuario = :idUsuario
	      and s.activo = true
	      and s.fechaInicio <= :fechaFin
	      and (s.fechaFin is null or s.fechaFin >= :fechaInicio)
	    order by s.fechaInicio desc
	    """)
    Optional<SalarioUsuario> buscarVigente(
	    @Param("idUsuario") Long idUsuario,
	    @Param("fechaInicio") LocalDate fechaInicio,
	    @Param("fechaFin") LocalDate fechaFin);
}
