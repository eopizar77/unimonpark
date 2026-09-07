package co.edu.unimonserrate.unimonpark.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import co.edu.unimonserrate.unimonpark.entity.Usuario;

public class UsuarioPrincipal implements UserDetails{

    private final Usuario usuario;

    public UsuarioPrincipal(Usuario usuario){
        this.usuario = usuario;
    }

    public Usuario getUsuario(){
        return usuario;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(){
        String nombreRol = "ROLE_" + usuario.getRol().getNombre().toUpperCase();
        return List.of(new SimpleGrantedAuthority(nombreRol));
    }

    @Override
    public String getPassword(){
        return usuario.getContrasenaHash();
    }

    @Override
    public String getUsername(){
        return usuario.getNombreUsuario();
    }

    @Override
    public boolean isAccountNonExpired(){
        return true;
    }

    @Override
    public boolean isAccountNonLocked(){
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired(){
        return true;
    }

    @Override
    public boolean isEnabled(){
        return usuario.getActivo();
    }
    
}
