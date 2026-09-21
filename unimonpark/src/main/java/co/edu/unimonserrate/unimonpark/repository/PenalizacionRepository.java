package co.edu.unimonserrate.unimonpark.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import co.edu.unimonserrate.unimonpark.entity.Penalizacion;

public interface PenalizacionRepository extends JpaRepository<Penalizacion, Long> {
}