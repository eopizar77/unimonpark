package co.edu.unimonserrate.unimonpark.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import co.edu.unimonserrate.unimonpark.aspect.Auditable;
import co.edu.unimonserrate.unimonpark.dto.FacturaRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.FacturaResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.Factura;
import co.edu.unimonserrate.unimonpark.entity.Salida;
import co.edu.unimonserrate.unimonpark.entity.Usuario;
import co.edu.unimonserrate.unimonpark.enums.EstadoFactura;
import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoDisponibleException;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.FacturaRepository;
import co.edu.unimonserrate.unimonpark.repository.SalidaRepository;
import co.edu.unimonserrate.unimonpark.repository.UsuarioRepository;
import co.edu.unimonserrate.unimonpark.service.FacturaService;

@Service
public class FacturaServiceImpl implements FacturaService{

    private final FacturaRepository facturaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SalidaRepository salidaRepository;

    public FacturaServiceImpl(FacturaRepository facturaRepository,
                                UsuarioRepository usuarioRepository,
                                SalidaRepository salidaRepository){
        this.facturaRepository = facturaRepository;
        this.usuarioRepository = usuarioRepository;
        this.salidaRepository = salidaRepository;
    }

    @Override
    public List<FacturaResponseDTO> listarFacturas(){
        return facturaRepository.findAll()
        .stream()
        .map(this::convertirADTO)
        .collect(Collectors.toList());
    }

    @Override
    public FacturaResponseDTO buscarPorId(Long id){
        Factura factura = facturaRepository.findById(id)
            .orElseThrow(() -> new RecursoNoEncontradoException("Factura no registrada con id: " + id));
        return convertirADTO(factura);
        }
    
    @Auditable(tabla = "factura", operacion = TipoOperacion.CREAR)
    @Override
    public FacturaResponseDTO crearFactura(FacturaRequestDTO dto){

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
            .orElseThrow(() -> new RecursoNoEncontradoException("El usuario no existe con el id: " + dto.getIdUsuario()));
        
        Salida salida = salidaRepository.findById(dto.getIdSalida())
            .orElseThrow(() -> new RecursoNoEncontradoException("La salida no se encuentra registrada id: " + dto.getIdSalida()));

            BigDecimal descuento = dto.getDescuento() !=null ? dto.getDescuento() : BigDecimal.ZERO;
            BigDecimal iva = dto.getIva() != null ? dto.getIva() : BigDecimal.ZERO;
            BigDecimal subtotal = salida.getValorTotal();
            if (descuento.compareTo(subtotal) > 0){
                throw new RecursoNoDisponibleException("El descuento no puede ser mayor que el subtotal");
            }
            BigDecimal total = subtotal.subtract(descuento).add(iva);

        Factura factura = new Factura();
        factura.setFecha(LocalDateTime.now());
        factura.setUsuario(usuario);
        factura.setSalida(salida);
        factura.setSubtotal(subtotal);
        factura.setDescuento(descuento);
        factura.setIva(iva);
        factura.setTotal(total);
        factura.setEstado(EstadoFactura.GENERADA);

        Factura facturaGuardada = facturaRepository.save(factura);

        return convertirADTO(facturaGuardada);
    }
    
    private FacturaResponseDTO convertirADTO(Factura factura){
        FacturaResponseDTO dto = new FacturaResponseDTO();
        dto.setIdFactura(factura.getIdFactura());
        dto.setIdUsuario(factura.getUsuario().getIdUsuario());
        dto.setNombres(factura.getUsuario().getNombres());
        dto.setApellidos(factura.getUsuario().getApellidos());
        dto.setFecha(factura.getFecha());
        dto.setSubtotal(factura.getSubtotal());
        dto.setDescuento(factura.getDescuento());
        dto.setIva(factura.getIva());
        dto.setTotal(factura.getTotal());
        dto.setEstado(factura.getEstado());
        dto.setIdSalida(factura.getSalida().getIdSalida());
        dto.setIdTarifa(factura.getSalida().getTarifa().getIdTarifa());
        dto.setNombreTarifa(factura.getSalida().getTarifa().getNombre());
        dto.setPlacaVehiculo(factura.getSalida().getIngreso().getVehiculo().getPlaca());
        return dto;
    }
    
}
