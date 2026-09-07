package co.edu.unimonserrate.unimonpark.service;

import java.util.List;

import co.edu.unimonserrate.unimonpark.dto.TarifaRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.TarifaResponseDTO;

public interface TarifaService {
    List<TarifaResponseDTO> listarTarifa();
    TarifaResponseDTO buscarPorId(Long id);
    TarifaResponseDTO crearTarifa(TarifaRequestDTO dto);
    TarifaResponseDTO actualizarTarifa(Long id, TarifaRequestDTO dto);
    void eliminarTarifa(Long id);
    
}
