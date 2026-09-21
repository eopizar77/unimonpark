package co.edu.unimonserrate.unimonpark.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unimonserrate.unimonpark.dto.ExternoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.ExternoResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.Externo;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoDisponibleException;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.ExternoRepository;
import co.edu.unimonserrate.unimonpark.service.ExternoService;

@Service
public class ExternoServiceImpl implements ExternoService {

    private final ExternoRepository externoRepository;

    public ExternoServiceImpl(ExternoRepository externoRepository) {
        this.externoRepository = externoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExternoResponseDTO> listarExternos() {
        return externoRepository.findAll().stream()
                .map(this::convertirADTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExternoResponseDTO buscarPorId(Long id) {
        return convertirADTO(externoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Externo no encontrado con id: " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public ExternoResponseDTO buscarPorDocumento(String numeroDocumento) {
        return convertirADTO(externoRepository.findByNumeroDocumento(numeroDocumento)
                .orElseThrow(() -> new RecursoNoEncontradoException("Externo no encontrado con documento: " + numeroDocumento)));
    }

    @Override
    @Transactional
    public ExternoResponseDTO crearExterno(ExternoRequestDTO dto) {
        if (externoRepository.existsByNumeroDocumento(dto.getNumeroDocumento())) {
            throw new RecursoNoDisponibleException("Ya existe un externo con el documento: " + dto.getNumeroDocumento());
        }
        Externo externo = new Externo();
        externo.setTipoDocumento(dto.getTipoDocumento());
        externo.setNumeroDocumento(dto.getNumeroDocumento());
        externo.setNombres(dto.getNombres());
        externo.setApellidos(dto.getApellidos());
        externo.setTelefono(dto.getTelefono());
        externo.setCorreo(dto.getCorreo());
        externo.setEmpresa(dto.getEmpresa());
        externo.setActivo(dto.getActivo() != null ? dto.getActivo() : true);
        externo.setFechaCreacion(LocalDateTime.now());
        return convertirADTO(externoRepository.save(externo));
    }

    @Override
    @Transactional
    public ExternoResponseDTO actualizarExterno(Long id, ExternoRequestDTO dto) {
        Externo externo = externoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Externo no encontrado con id: " + id));
        if (!externo.getNumeroDocumento().equals(dto.getNumeroDocumento())
                && externoRepository.existsByNumeroDocumento(dto.getNumeroDocumento())) {
            throw new RecursoNoDisponibleException("Ya existe un externo con el documento: " + dto.getNumeroDocumento());
        }
        externo.setTipoDocumento(dto.getTipoDocumento());
        externo.setNumeroDocumento(dto.getNumeroDocumento());
        externo.setNombres(dto.getNombres());
        externo.setApellidos(dto.getApellidos());
        externo.setTelefono(dto.getTelefono());
        externo.setCorreo(dto.getCorreo());
        externo.setEmpresa(dto.getEmpresa());
        externo.setActivo(dto.getActivo());
        return convertirADTO(externoRepository.save(externo));
    }

    @Override
    @Transactional
    public void eliminarExterno(Long id) {
        Externo externo = externoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Externo no encontrado con id: " + id));
        try {
            externoRepository.delete(externo);
            externoRepository.flush();
        } catch (Exception e) {
            externo.setActivo(false);
            externoRepository.save(externo);
        }
    }

    private ExternoResponseDTO convertirADTO(Externo externo) {
        ExternoResponseDTO dto = new ExternoResponseDTO();
        dto.setIdExterno(externo.getIdExterno());
        dto.setTipoDocumento(externo.getTipoDocumento());
        dto.setNumeroDocumento(externo.getNumeroDocumento());
        dto.setNombres(externo.getNombres());
        dto.setApellidos(externo.getApellidos());
        dto.setTelefono(externo.getTelefono());
        dto.setCorreo(externo.getCorreo());
        dto.setEmpresa(externo.getEmpresa());
        dto.setActivo(externo.getActivo());
        dto.setFechaCreacion(externo.getFechaCreacion());
        return dto;
    }
}