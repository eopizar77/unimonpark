package co.edu.unimonserrate.unimonpark.service;

import java.util.List;
import co.edu.unimonserrate.unimonpark.dto.TipoVehiculoDTO;

public interface TipoVehiculoService {

    List<TipoVehiculoDTO> listarTipoVehiculo();
    TipoVehiculoDTO guardarTipoVehiculo(TipoVehiculoDTO TipoVehiculo);
    TipoVehiculoDTO buscarPorId(Long id);
    void eliminarTipoVehiculo(Long id);
}