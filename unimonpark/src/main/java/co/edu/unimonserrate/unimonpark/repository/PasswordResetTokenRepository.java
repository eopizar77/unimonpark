package co.edu.unimonserrate.unimonpark.repository;

import co.edu.unimonserrate.unimonpark.entity.PasswordResetToken;
import co.edu.unimonserrate.unimonpark.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUsuario(Usuario usuario);
    void deleteByUsuario(Usuario usuario);
}

