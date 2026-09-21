package co.edu.unimonserrate.unimonpark.service;

import java.util.List;
import co.edu.unimonserrate.unimonpark.dto.ExternoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.ExternoResponseDTO;

public interface ExternoService {
    List<ExternoResponseDTO> listarExternos();
    ExternoResponseDTO buscarPorId(Long id);
    ExternoResponseDTO buscarPorDocumento(String numeroDocumento);
    ExternoResponseDTO crearExterno(ExternoRequestDTO dto);
    ExternoResponseDTO actualizarExterno(Long id, ExternoRequestDTO dto);
    void eliminarExterno(Long id);
}