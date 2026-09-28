package co.edu.unimonserrate.unimonpark.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import co.edu.unimonserrate.unimonpark.entity.Vehiculo;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Long>{
	boolean existsByPlaca(String placa);

	boolean existsByPlacaAndIdVehiculoNot(String placa, Long idVehiculo);
}
