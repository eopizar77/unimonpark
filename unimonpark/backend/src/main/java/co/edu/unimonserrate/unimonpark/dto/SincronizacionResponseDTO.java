package co.edu.unimonserrate.unimonpark.dto;

public class SincronizacionResponseDTO {
    private String documento;
    private String nombres;
    private String apellidos;
    private String correo;
    private Boolean activo;
    private String rolOriginal;
    private Long idRol;
    private Boolean esExterno;

    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
    
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    
    public String getRolOriginal() { return rolOriginal; }
    public void setRolOriginal(String rolOriginal) { this.rolOriginal = rolOriginal; }
    
    public Long getIdRol() { return idRol; }
    public void setIdRol(Long idRol) { this.idRol = idRol; }
    
    public Boolean getEsExterno() { return esExterno; }
    public void setEsExterno(Boolean esExterno) { this.esExterno = esExterno; }
}
