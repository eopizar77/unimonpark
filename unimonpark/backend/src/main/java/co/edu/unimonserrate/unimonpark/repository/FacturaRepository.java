package co.edu.unimonserrate.unimonpark.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import co.edu.unimonserrate.unimonpark.entity.Factura;

public interface FacturaRepository extends JpaRepository<Factura, Long> {

    List<Factura> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);

    List<Factura> findByUsuario_NombresContainingIgnoreCaseOrUsuario_ApellidosContainingIgnoreCase(
            String nombres, String apellidos);

}
