package co.edu.unimonserrate.unimonpark.service;


import java.util.List;

import co.edu.unimonserrate.unimonpark.dto.VehiculoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.VehiculoResponseDTO;

public interface VehiculoService {
    List<VehiculoResponseDTO> listarVehiculos();
    VehiculoResponseDTO buscarPorId(Long id);
    VehiculoResponseDTO crearVehiculo(VehiculoRequestDTO dto);
    VehiculoResponseDTO actualizarVehiculo(Long id, VehiculoRequestDTO dto);
    void eliminarVehiculo(Long id);
}
