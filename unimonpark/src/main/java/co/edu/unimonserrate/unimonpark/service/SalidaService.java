package co.edu.unimonserrate.unimonpark.service;

import java.util.List;

import co.edu.unimonserrate.unimonpark.dto.SalidaRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.SalidaResponseDTO;

public interface SalidaService {
    List<SalidaResponseDTO> listarSalidas();
    SalidaResponseDTO buscarPorId(Long id);
    SalidaResponseDTO crearSalida(SalidaRequestDTO dto);
}