package co.edu.unimonserrate.unimonpark.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import co.edu.unimonserrate.unimonpark.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long>{

    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
}