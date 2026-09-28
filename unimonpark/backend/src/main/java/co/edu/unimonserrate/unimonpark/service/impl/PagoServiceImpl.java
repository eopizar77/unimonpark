package co.edu.unimonserrate.unimonpark.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import co.edu.unimonserrate.unimonpark.aspect.Auditable;
import co.edu.unimonserrate.unimonpark.dto.PagoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.PagoResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.Factura;
import co.edu.unimonserrate.unimonpark.entity.Pago;
import co.edu.unimonserrate.unimonpark.enums.EstadoPago;
import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.FacturaRepository;
import co.edu.unimonserrate.unimonpark.repository.PagoRepository;
import co.edu.unimonserrate.unimonpark.service.PagoService;

@Service
public class PagoServiceImpl implements PagoService {

    private final PagoRepository pagoRepository;
    private final FacturaRepository facturaRepository;

    public PagoServiceImpl(PagoRepository pagoRepository, FacturaRepository facturaRepository) {
        this.pagoRepository = pagoRepository;
        this.facturaRepository = facturaRepository;
    }

    @Override
    public List<PagoResponseDTO> listarPagos() {
        return pagoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    public PagoResponseDTO buscarPorId(Long id) {
        Pago pagos = pagoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pago no registrado con ID: " + id));
        return convertirADTO(pagos);
    }

    @Auditable(tabla = "pago", operacion = TipoOperacion.CREAR)
    @Override
    public PagoResponseDTO crearPagos(PagoRequestDTO dto) {

        Factura factura = facturaRepository.findById(dto.getIdFactura())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Factura no encontrada o registrada ID: " + dto.getIdFactura()));

        Pago pagos = new Pago();
        pagos.setFactura(factura);
        pagos.setFecha(LocalDateTime.now());
        pagos.setMonto(factura.getTotal());
        pagos.setMetodoPago(dto.getMetodoPago());
        pagos.setReferencia(dto.getReferencia());
        pagos.setEstado(EstadoPago.APROBADO);

        Pago pagoRegistrado = pagoRepository.save(pagos);

        return convertirADTO(pagoRegistrado);
    }

    @Override
    public List<PagoResponseDTO> buscarPagos(LocalDateTime desde, LocalDateTime hasta,
            String metodoPago, String usuario) {

        List<Pago> base;
        if (desde != null && hasta != null && metodoPago != null) {
            base = pagoRepository.findByMetodoPagoAndFechaBetween(metodoPago, desde, hasta);
        } else if (desde != null && hasta != null) {
            base = pagoRepository.findByFechaBetween(desde, hasta);
        } else {
            base = pagoRepository.findAll();
        }

        return base.stream()
                .filter(p -> metodoPago == null || p.getMetodoPago().equalsIgnoreCase(metodoPago))
                .filter(p -> usuario == null
                        || p.getFactura().getUsuario().getNombres().toLowerCase().contains(usuario.toLowerCase())
                        || p.getFactura().getUsuario().getApellidos().toLowerCase().contains(usuario.toLowerCase()))
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    private PagoResponseDTO convertirADTO(Pago pagos) {
        PagoResponseDTO dto = new PagoResponseDTO();
        dto.setIdPago(pagos.getIdPago());
        dto.setIdFactura(pagos.getFactura().getIdFactura());
        dto.setFecha(pagos.getFecha());
        dto.setMonto(pagos.getMonto());
        dto.setMetodoPago(pagos.getMetodoPago());
        dto.setReferencia(pagos.getReferencia());
        dto.setEstado(pagos.getEstado());
        return dto;
    }
}