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
import co.edu.unimonserrate.unimonpark.entity.Externo;
import co.edu.unimonserrate.unimonpark.entity.Ingreso;
import co.edu.unimonserrate.unimonpark.entity.Salida;
import co.edu.unimonserrate.unimonpark.entity.Usuario;
import co.edu.unimonserrate.unimonpark.entity.Vehiculo;
import co.edu.unimonserrate.unimonpark.enums.EstadoFactura;
import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoDisponibleException;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.FacturaRepository;
import co.edu.unimonserrate.unimonpark.repository.SalidaRepository;
import co.edu.unimonserrate.unimonpark.repository.UsuarioRepository;
import co.edu.unimonserrate.unimonpark.repository.ExternoRepository;
import co.edu.unimonserrate.unimonpark.service.FacturaService;

@Service
public class FacturaServiceImpl implements FacturaService {

        private final FacturaRepository facturaRepository;
        private final UsuarioRepository usuarioRepository;
        private final ExternoRepository externoRepository;
        private final SalidaRepository salidaRepository;

        public FacturaServiceImpl(FacturaRepository facturaRepository,
                        UsuarioRepository usuarioRepository,
                        ExternoRepository externoRepository,
                        SalidaRepository salidaRepository) {
                this.facturaRepository = facturaRepository;
                this.usuarioRepository = usuarioRepository;
                this.externoRepository = externoRepository;
                this.salidaRepository = salidaRepository;
        }

        @Override
        public List<FacturaResponseDTO> listarFacturas() {
                return facturaRepository.findAll()
                                .stream()
                                .map(this::convertirADTO)
                                .collect(Collectors.toList());
        }

        @Override
        public FacturaResponseDTO buscarPorId(Long id) {
                Factura factura = facturaRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Factura no registrada con id: " + id));
                return convertirADTO(factura);
        }

        @Auditable(tabla = "factura", operacion = TipoOperacion.CREAR)
        @Override
        public FacturaResponseDTO crearFactura(FacturaRequestDTO dto) {

                if (dto.getIdUsuario() == null && dto.getIdExterno() == null) {
                        throw new RecursoNoDisponibleException("Debe indicar un usuario o un visitante externo");
                }

                Usuario usuario = null;
                if (dto.getIdUsuario() != null) {
                        usuario = usuarioRepository.findById(dto.getIdUsuario())
                                        .orElseThrow(() -> new RecursoNoEncontradoException(
                                                        "El usuario no existe con el id: " + dto.getIdUsuario()));
                }

                Externo externo = null;
                if (dto.getIdExterno() != null) {
                        externo = externoRepository.findById(dto.getIdExterno())
                                        .orElseThrow(() -> new RecursoNoEncontradoException(
                                                        "El visitante externo no existe con el id: " + dto.getIdExterno()));
                }

                Salida salida = salidaRepository.findById(dto.getIdSalida())
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "La salida no se encuentra registrada id: " + dto.getIdSalida()));

                BigDecimal descuento = dto.getDescuento() != null ? dto.getDescuento() : BigDecimal.ZERO;
                BigDecimal iva = dto.getIva() != null ? dto.getIva() : BigDecimal.ZERO;
                BigDecimal subtotal = salida.getValorTotal();
                if (descuento.compareTo(subtotal) > 0) {
                        throw new RecursoNoDisponibleException("El descuento no puede ser mayor que el subtotal");
                }
                BigDecimal total = subtotal.subtract(descuento).add(iva);

                Factura factura = new Factura();
                factura.setFecha(LocalDateTime.now());
                factura.setUsuario(usuario);
                factura.setExterno(externo);
                factura.setSalida(salida);
                factura.setSubtotal(subtotal);
                factura.setDescuento(descuento);
                factura.setIva(iva);
                factura.setTotal(total);
                factura.setEstado(EstadoFactura.GENERADA);

                Factura facturaGuardada = facturaRepository.save(factura);

                return convertirADTO(facturaGuardada);
        }

        @Override
        public List<FacturaResponseDTO> buscarFacturas(LocalDateTime desde, LocalDateTime hasta,
                        String categoriaPersona, String busquedaCliente) {

                List<Factura> base = (desde != null && hasta != null)
                                ? facturaRepository.findByFechaBetween(desde, hasta)
                                : facturaRepository.findAll();

                return base.stream()
                                .filter(f -> categoriaPersona == null
                                                || f.getSalida().getIngreso().getVehiculo().getCategoriaPersona().name()
                                                                .equalsIgnoreCase(categoriaPersona))
                                .filter(f -> {
                                        if (busquedaCliente == null)
                                                return true;
                                        if (f.getUsuario() != null) {
                                                return f.getUsuario().getNombres().toLowerCase()
                                                                .contains(busquedaCliente.toLowerCase())
                                                                || f.getUsuario().getApellidos().toLowerCase()
                                                                                .contains(busquedaCliente.toLowerCase());
                                        }
                                        if (f.getExterno() != null) {
                                                return f.getExterno().getNombres().toLowerCase()
                                                                .contains(busquedaCliente.toLowerCase())
                                                                || f.getExterno().getApellidos().toLowerCase()
                                                                                .contains(busquedaCliente.toLowerCase());
                                        }
                                        return false;
                                })
                                .map(this::convertirADTO)
                                .collect(Collectors.toList());
        }

        private FacturaResponseDTO convertirADTO(Factura factura) {
                FacturaResponseDTO dto = new FacturaResponseDTO();
                dto.setIdFactura(factura.getIdFactura());
                
                if (factura.getUsuario() != null) {
                        dto.setIdUsuario(factura.getUsuario().getIdUsuario());
                        dto.setNombres(factura.getUsuario().getNombres());
                        dto.setApellidos(factura.getUsuario().getApellidos());
                } else if (factura.getExterno() != null) {
                        dto.setIdExterno(factura.getExterno().getIdExterno());
                        dto.setNombres(factura.getExterno().getNombres());
                        dto.setApellidos(factura.getExterno().getApellidos());
                }

                dto.setFecha(factura.getFecha());
                dto.setSubtotal(factura.getSubtotal());
                dto.setDescuento(factura.getDescuento());
                dto.setIva(factura.getIva());
                dto.setTotal(factura.getTotal());
                dto.setEstado(factura.getEstado());
                dto.setIdSalida(factura.getSalida().getIdSalida());

                if (factura.getSalida().getTarifa() != null) {
                        dto.setIdTarifa(factura.getSalida().getTarifa().getIdTarifa());
                        dto.setNombreTarifa(factura.getSalida().getTarifa().getNombre());
                }

                Ingreso ingreso = factura.getSalida().getIngreso();
                Vehiculo vehiculo = ingreso.getVehiculo();
                String identificador = vehiculo.getPlaca() != null
                                ? vehiculo.getPlaca()
                                : "Ficha " + ingreso.getNumeroFicha();
                dto.setPlacaVehiculo(identificador);
                dto.setTipoVehiculo(vehiculo.getTipoVehiculo().getNombre());
                dto.setCategoriaPersona(vehiculo.getCategoriaPersona().name());

                return dto;
        }
}
