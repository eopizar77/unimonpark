package co.edu.unimonserrate.unimonpark.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import co.edu.unimonserrate.unimonpark.entity.Ingreso;
import co.edu.unimonserrate.unimonpark.enums.EstadoIngreso;

public interface IngresoRepository extends JpaRepository<Ingreso, Long> {
	boolean existsByVehiculoIdVehiculoAndEstado(Long idVehiculo, EstadoIngreso estado);
	boolean existsByNumeroFichaAndEstado(String numeroFicha, EstadoIngreso estado);

	List<Ingreso> findByFechaIngresoBetween(LocalDateTime desde, LocalDateTime hasta);

	List<Ingreso> findByVehiculo_TipoVehiculo_NombreAndFechaIngresoBetween(
			String nombreTipo, LocalDateTime desde, LocalDateTime hasta);

	List<Ingreso> findByVehiculo_Usuario_NombresContainingIgnoreCaseOrVehiculo_Usuario_ApellidosContainingIgnoreCase(
			String nombres, String apellidos);
}
