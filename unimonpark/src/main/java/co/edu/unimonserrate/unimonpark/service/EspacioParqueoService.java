package co.edu.unimonserrate.unimonpark.service;

import java.util.List;

import co.edu.unimonserrate.unimonpark.dto.EspacioParqueoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.EspacioParqueoResponseDTO;

public interface EspacioParqueoService {
    List<EspacioParqueoResponseDTO> listarEspacioParqueo();
    EspacioParqueoResponseDTO buscarPorId(Long id);
    EspacioParqueoResponseDTO crearEspacioParqueo(EspacioParqueoRequestDTO dto);
    EspacioParqueoResponseDTO actualizarEspacioParqueo(Long id, EspacioParqueoRequestDTO dto);
    void eliminarEspacioParqueo(Long id);
}
