package co.edu.unimonserrate.unimonpark.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import co.edu.unimonserrate.unimonpark.entity.MatriculaUsuario;

public interface MatriculaUsuarioRepository extends JpaRepository<MatriculaUsuario, Long> {

    @Query("""
	    select m from MatriculaUsuario m
	    where m.usuario.idUsuario = :idUsuario
	      and m.activo = true
	      and m.fechaInicio <= :fechaFin
	      and (m.fechaFin is null or m.fechaFin >= :fechaInicio)
	    order by m.fechaInicio desc
	    """)
    Optional<MatriculaUsuario> buscarVigente(
	    @Param("idUsuario") Long idUsuario,
	    @Param("fechaInicio") LocalDate fechaInicio,
	    @Param("fechaFin") LocalDate fechaFin);
}
