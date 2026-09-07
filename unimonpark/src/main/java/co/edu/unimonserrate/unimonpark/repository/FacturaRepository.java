package co.edu.unimonserrate.unimonpark.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import co.edu.unimonserrate.unimonpark.entity.Factura;

public interface FacturaRepository extends JpaRepository<Factura, Long>{
    
}
