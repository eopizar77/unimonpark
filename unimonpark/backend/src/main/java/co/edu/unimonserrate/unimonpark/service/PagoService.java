package co.edu.unimonserrate.unimonpark.service;

import java.time.LocalDateTime;
import java.util.List;

import co.edu.unimonserrate.unimonpark.dto.PagoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.PagoResponseDTO;

public interface PagoService {
    List<PagoResponseDTO> listarPagos();
    PagoResponseDTO buscarPorId(Long id);
    PagoResponseDTO crearPagos(PagoRequestDTO dto);
    List<PagoResponseDTO> buscarPagos(LocalDateTime desde, LocalDateTime hasta, String metodoPago, String usuario);
}