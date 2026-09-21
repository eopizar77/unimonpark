package co.edu.unimonserrate.unimonpark.service;

import java.util.List;
import co.edu.unimonserrate.unimonpark.dto.MembresiaRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.MembresiaResponseDTO;

public interface MembresiaService {
    List<MembresiaResponseDTO> listarMembresias();
    MembresiaResponseDTO buscarPorId(Long id);
    MembresiaResponseDTO crearMembresia(MembresiaRequestDTO dto);
}