package co.edu.unimonserrate.unimonpark.service;

import java.util.List;
import co.edu.unimonserrate.unimonpark.dto.PenalizacionRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.PenalizacionResponseDTO;

public interface PenalizacionService {
    List<PenalizacionResponseDTO> listarPenalizaciones();
    PenalizacionResponseDTO crearPenalizacion(PenalizacionRequestDTO dto);
    PenalizacionResponseDTO marcarComoPagada(Long id);
}