package co.edu.unimonserrate.unimonpark.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import co.edu.unimonserrate.unimonpark.dto.PenalizacionRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.PenalizacionResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.Penalizacion;
import co.edu.unimonserrate.unimonpark.entity.Vehiculo;
import co.edu.unimonserrate.unimonpark.enums.EstadoPenalizacion;
import co.edu.unimonserrate.unimonpark.enums.TipoPenalizacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.PenalizacionRepository;
import co.edu.unimonserrate.unimonpark.repository.VehiculoRepository;
import co.edu.unimonserrate.unimonpark.service.PenalizacionService;

import java.math.BigDecimal;

@Service
public class PenalizacionServiceImpl implements PenalizacionService {

    private final PenalizacionRepository penalizacionRepository;
    private final VehiculoRepository vehiculoRepository;

    public PenalizacionServiceImpl(PenalizacionRepository penalizacionRepository,
                                    VehiculoRepository vehiculoRepository) {
        this.penalizacionRepository = penalizacionRepository;
        this.vehiculoRepository = vehiculoRepository;
    }

    @Override
    public List<PenalizacionResponseDTO> listarPenalizaciones() {
        return penalizacionRepository.findAll().stream()
                .map(this::convertirADTO).collect(Collectors.toList());
    }

    @Override
    public PenalizacionResponseDTO crearPenalizacion(PenalizacionRequestDTO dto) {
        Vehiculo vehiculo = vehiculoRepository.findById(dto.getIdVehiculo())
                .orElseThrow(() -> new RecursoNoEncontradoException("Vehículo no encontrado con id: " + dto.getIdVehiculo()));

        BigDecimal valor = dto.getTipo() == TipoPenalizacion.TICKET_PERDIDO
                ? new BigDecimal("3000")
                : new BigDecimal("25000");

        Penalizacion p = new Penalizacion();
        p.setVehiculo(vehiculo);
        p.setTipo(dto.getTipo());
        p.setValor(valor);
        p.setEstado(EstadoPenalizacion.PENDIENTE);
        p.setFechaCreacion(LocalDateTime.now());
        p.setObservaciones(dto.getObservaciones());

        return convertirADTO(penalizacionRepository.save(p));
    }

    @Override
    public PenalizacionResponseDTO marcarComoPagada(Long id) {
        Penalizacion p = penalizacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Penalización no encontrada con id: " + id));
        p.setEstado(EstadoPenalizacion.PAGADA);
        p.setFechaPago(LocalDateTime.now());
        return convertirADTO(penalizacionRepository.save(p));
    }

    private PenalizacionResponseDTO convertirADTO(Penalizacion p) {
        PenalizacionResponseDTO dto = new PenalizacionResponseDTO();
        dto.setIdPenalizacion(p.getIdPenalizacion());
        dto.setIdVehiculo(p.getVehiculo().getIdVehiculo());
        dto.setPlacaVehiculo(p.getVehiculo().getPlaca());
        dto.setTipo(p.getTipo());
        dto.setValor(p.getValor());
        dto.setEstado(p.getEstado());
        dto.setFechaCreacion(p.getFechaCreacion());
        dto.setFechaPago(p.getFechaPago());
        dto.setObservaciones(p.getObservaciones());
        return dto;
    }
}