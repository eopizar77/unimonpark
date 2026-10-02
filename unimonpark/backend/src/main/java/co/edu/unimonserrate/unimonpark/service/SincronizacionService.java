package co.edu.unimonserrate.unimonpark.service;

import co.edu.unimonserrate.unimonpark.dto.SincronizacionResponseDTO;

public interface SincronizacionService {
    SincronizacionResponseDTO buscarPersona(String documento);
}
