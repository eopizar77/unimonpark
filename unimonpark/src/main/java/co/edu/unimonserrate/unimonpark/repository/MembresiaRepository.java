package co.edu.unimonserrate.unimonpark.repository;

import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import co.edu.unimonserrate.unimonpark.entity.Membresia;

public interface MembresiaRepository extends JpaRepository<Membresia, Long> {
    Optional<Membresia> findFirstByVehiculo_IdVehiculoAndFechaFinGreaterThanEqualOrderByFechaFinDesc(
            Long idVehiculo, LocalDateTime ahora);
}