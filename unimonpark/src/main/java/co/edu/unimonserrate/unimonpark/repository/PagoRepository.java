package co.edu.unimonserrate.unimonpark.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import co.edu.unimonserrate.unimonpark.entity.Pago;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);

    List<Pago> findByMetodoPagoAndFechaBetween(String metodoPago, LocalDateTime desde, LocalDateTime hasta);

    List<Pago> findByFactura_Usuario_NombresContainingIgnoreCaseOrFactura_Usuario_ApellidosContainingIgnoreCase(
            String nombres, String apellidos);

}
