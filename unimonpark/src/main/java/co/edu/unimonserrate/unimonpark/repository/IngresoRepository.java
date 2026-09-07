package co.edu.unimonserrate.unimonpark.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import co.edu.unimonserrate.unimonpark.entity.Ingreso;

public interface IngresoRepository extends JpaRepository<Ingreso, Long>{
    
}
