package co.edu.unimonserrate.unimonpark.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Entity
@Table(name = "roles")
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRol;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;

    @Column(length = 150)
    private String descripcion;

    @Column(nullable = false)
    private Boolean activo;

    // Constructor vacio, obligatorio para JPA
    public Rol(){        
    }

    // Contructor con parametros: para la creacion de objetos nuevos en el codigo.
    public Rol(String nombre,
        String descripcion,
        Boolean activo){
            this.nombre = nombre;
            this.descripcion = descripcion;
            this.activo = activo;
    }

    public Long getIdRol() {
        return idRol;
    }

    public void setIdRol(Long idRol){
        this.idRol = idRol;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre){
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion){
        this.descripcion = descripcion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo){
        this.activo = activo;
    }
}