package co.edu.unimonserrate.unimonpark.dto;

public class RegistroPublicoDTO {
    private String documento;
    private String nombres;
    private String apellidos;
    private String correo;
    private Long idRol;
    
    private Long tipoVehiculoId;
    private String placa;
    private String marca;
    private String modelo;
    private String color;

    // Getters and Setters
    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public Long getIdRol() { return idRol; }
    public void setIdRol(Long idRol) { this.idRol = idRol; }
    
    public Long getTipoVehiculoId() { return tipoVehiculoId; }
    public void setTipoVehiculoId(Long tipoVehiculoId) { this.tipoVehiculoId = tipoVehiculoId; }
    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
