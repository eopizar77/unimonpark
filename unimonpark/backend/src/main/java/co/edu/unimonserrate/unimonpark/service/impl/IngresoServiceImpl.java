package co.edu.unimonserrate.unimonpark.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import co.edu.unimonserrate.unimonpark.aspect.Auditable;
import co.edu.unimonserrate.unimonpark.dto.IngresoRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.IngresoResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.EspacioParqueo;
import co.edu.unimonserrate.unimonpark.entity.Ingreso;
import co.edu.unimonserrate.unimonpark.entity.Vehiculo;
import co.edu.unimonserrate.unimonpark.enums.EstadoEspacio;
import co.edu.unimonserrate.unimonpark.enums.EstadoIngreso;
import co.edu.unimonserrate.unimonpark.enums.TipoOperacion;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoDisponibleException;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.EspacioParqueoRepository;
import co.edu.unimonserrate.unimonpark.repository.IngresoRepository;
import co.edu.unimonserrate.unimonpark.repository.VehiculoRepository;
import co.edu.unimonserrate.unimonpark.service.IngresoService;

@Service
public class IngresoServiceImpl implements IngresoService {

        private final IngresoRepository ingresoRepository;
        private final VehiculoRepository vehiculoRepository;
        private final EspacioParqueoRepository espacioParqueoRepository;

        public IngresoServiceImpl(IngresoRepository ingresoRepository, VehiculoRepository vehiculoRepository,
                        EspacioParqueoRepository espacioParqueoRepository) {
                this.ingresoRepository = ingresoRepository;
                this.vehiculoRepository = vehiculoRepository;
                this.espacioParqueoRepository = espacioParqueoRepository;
        }

        @Override
        public List<IngresoResponseDTO> listarIngreso() {
                return ingresoRepository.findAll()
                                .stream()
                                .map(this::convertirADTO)
                                .collect(Collectors.toList());
        }

        public List<IngresoResponseDTO> buscarIngresos(LocalDateTime desde, LocalDateTime hasta, String nombreTipo,
                        String nombreUsuario) {
                List<Ingreso> base = (desde != null && hasta != null)
                                ? ingresoRepository.findByFechaIngresoBetween(desde, hasta)
                                : ingresoRepository.findAll();

                return base.stream()
                                .filter(i -> nombreTipo == null
                                                || i.getVehiculo().getTipoVehiculo().getNombre()
                                                                .equalsIgnoreCase(nombreTipo))
                                .filter(i -> {
                                        if (nombreUsuario == null)
                                                return true;
                                        Vehiculo v = i.getVehiculo();
                                        if (v.getUsuario() != null) {
                                                return v.getUsuario().getNombres().toLowerCase()
                                                                .contains(nombreUsuario.toLowerCase())
                                                                || v.getUsuario().getApellidos().toLowerCase()
                                                                                .contains(nombreUsuario.toLowerCase());
                                        }
                                        if (v.getExterno() != null) {
                                                return v.getExterno().getNombres().toLowerCase()
                                                                .contains(nombreUsuario.toLowerCase())
                                                                || v.getExterno().getApellidos().toLowerCase()
                                                                                .contains(nombreUsuario.toLowerCase());
                                        }
                                        return false;
                                })
                                .map(this::convertirADTO)
                                .collect(Collectors.toList());
        }

        @Override
        public IngresoResponseDTO buscarPorId(Long id) {
                Ingreso ingreso = ingresoRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Ingreso no encontrado con id: " + id));
                return convertirADTO(ingreso);
        }

        @Auditable(tabla = "ingreso", operacion = TipoOperacion.CREAR)
        @Override
        public IngresoResponseDTO crearIngreso(IngresoRequestDTO dto) {

                Vehiculo vehiculo = vehiculoRepository.findById(dto.getIdVehiculo())
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Tipo de Vehiculo no encontrado con el id: " + dto.getIdVehiculo()));

                if (dto.getNumeroFicha() != null && !dto.getNumeroFicha().trim().isEmpty()) {
                        if (ingresoRepository.existsByNumeroFichaAndEstado(dto.getNumeroFicha(), EstadoIngreso.ACTIVO)) {
                                throw new RecursoNoDisponibleException(
                                                "El número de ficha " + dto.getNumeroFicha() + " ya se encuentra asignado a una bicicleta adentro.");
                        }
                }

                if (ingresoRepository.existsByVehiculoIdVehiculoAndEstado(
                                vehiculo.getIdVehiculo(), EstadoIngreso.ACTIVO)) {
                        throw new RecursoNoDisponibleException(
                                        "El vehículo " + vehiculo.getPlaca() + " ya tiene un ingreso activo");
                }

                EspacioParqueo espacioParqueo = espacioParqueoRepository.findById(dto.getIdEspacioParqueo())
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Tipo de espacio no encontrado con id: " + dto.getIdEspacioParqueo()));

                if (espacioParqueo.getEstado() != EstadoEspacio.DISPONIBLE) {
                        throw new RecursoNoDisponibleException(
                                        "El Espacio de parqueo " + espacioParqueo.getCodigo() + " no está disponible");
                }

                Ingreso ingreso = new Ingreso();
                ingreso.setFechaIngreso(LocalDateTime.now());
                ingreso.setLecturaInicialKm(dto.getLecturaInicialKm());
                ingreso.setTipoIngreso(dto.getTipoIngreso());
                ingreso.setEstado(EstadoIngreso.ACTIVO);
                ingreso.setVehiculo(vehiculo);
                ingreso.setEspacioParqueo(espacioParqueo);
                ingreso.setNumeroFicha(dto.getNumeroFicha());

                Ingreso ingresoActualizado = ingresoRepository.save(ingreso);
                espacioParqueo.setEstado(EstadoEspacio.OCUPADO);
                espacioParqueoRepository.save(espacioParqueo);

                return convertirADTO(ingresoActualizado);
        }

        @Auditable(tabla = "ingreso", operacion = TipoOperacion.ELIMINAR)
        @Override
        public void eliminarIngreso(Long id) {
                ingresoRepository.deleteById(id);
        }

        private IngresoResponseDTO convertirADTO(Ingreso ingreso) {
                IngresoResponseDTO dto = new IngresoResponseDTO();
                dto.setIdIngreso(ingreso.getIdIngreso());
                dto.setFechaIngreso(ingreso.getFechaIngreso());
                dto.setLecturaInicialKm(ingreso.getLecturaInicialKm());
                dto.setTipoIngreso(ingreso.getTipoIngreso());
                dto.setEstado(ingreso.getEstado());
                dto.setIdVehiculo(ingreso.getVehiculo().getIdVehiculo());
                dto.setPlacaVehiculo(ingreso.getVehiculo().getPlaca());
                dto.setIdEspacioParqueo(ingreso.getEspacioParqueo().getIdEspacio());
                dto.setCodigoEspacioParqueo(ingreso.getEspacioParqueo().getCodigo());
                dto.setNumeroFicha(ingreso.getNumeroFicha());
                return dto;
        }
}