package co.edu.unimonserrate.unimonpark.service;

import java.util.List;

import co.edu.unimonserrate.unimonpark.dto.FacturaRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.FacturaResponseDTO;

public interface FacturaService {
    List<FacturaResponseDTO> listarFacturas();
    FacturaResponseDTO buscarPorId(Long id);
    FacturaResponseDTO crearFactura(FacturaRequestDTO dto);
}
