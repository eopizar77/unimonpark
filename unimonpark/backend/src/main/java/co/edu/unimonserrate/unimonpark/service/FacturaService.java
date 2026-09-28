package co.edu.unimonserrate.unimonpark.service;

import java.time.LocalDateTime;
import java.util.List;

import co.edu.unimonserrate.unimonpark.dto.FacturaRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.FacturaResponseDTO;

public interface FacturaService {
    List<FacturaResponseDTO> listarFacturas();
    FacturaResponseDTO buscarPorId(Long id);
    FacturaResponseDTO crearFactura(FacturaRequestDTO dto);
    List<FacturaResponseDTO> buscarFacturas(LocalDateTime desde, LocalDateTime hasta, String categoriaPersona, String usuario);
}
