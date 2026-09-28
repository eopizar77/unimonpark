package co.edu.unimonserrate.unimonpark.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import co.edu.unimonserrate.unimonpark.entity.Externo;

public interface ExternoRepository extends JpaRepository<Externo, Long> {
    Optional<Externo> findByNumeroDocumento(String numeroDocumento);
    boolean existsByNumeroDocumento(String numeroDocumento);
}