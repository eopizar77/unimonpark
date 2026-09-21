package co.edu.unimonserrate.unimonpark.service;

import java.util.List;

import co.edu.unimonserrate.unimonpark.dto.MensualidadRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.MensualidadResponseDTO;

public interface MensualidadUsuarioService {
    List<MensualidadResponseDTO> listar();
    MensualidadResponseDTO buscarPorId(Long id);
    MensualidadResponseDTO crear(MensualidadRequestDTO dto);
}
