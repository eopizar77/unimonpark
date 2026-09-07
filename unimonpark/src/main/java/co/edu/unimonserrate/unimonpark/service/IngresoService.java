package co.edu.unimonserrate.unimonpark.service;

import java.util.List;

import co.edu.unimonserrate.unimonpark.dto.IngresoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.IngresoResponseDTO;

public interface IngresoService {
    List<IngresoResponseDTO> listarIngreso();
    IngresoResponseDTO buscarPorId(Long id);
    IngresoResponseDTO crearIngreso(IngresoRequestDTO dto);
    void eliminarIngreso(Long id);    
}