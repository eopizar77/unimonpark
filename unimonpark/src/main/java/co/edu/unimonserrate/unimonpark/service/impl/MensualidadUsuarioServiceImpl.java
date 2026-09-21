package co.edu.unimonserrate.unimonpark.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import co.edu.unimonserrate.unimonpark.aspect.Auditable;
import co.edu.unimonserrate.unimonpark.dto.MensualidadRequestDTO;
import co.edu.unimonserrate.unimonpark.dto.MensualidadResponseDTO;
import co.edu.unimonserrate.unimonpark.entity.MatriculaUsuario;
import co.edu.unimonserrate.unimonpark.entity.MensualidadUsuario;
import co.edu.unimonserrate.unimonpark.entity.SalarioUsuario;
import co.edu.unimonserrate.unimonpark.entity.Tarifa;
import co.edu.unimonserrate.unimonpark.entity.Usuario;
import co.edu.unimonserrate.unimonpark.entity.Vehiculo;
import co.edu.unimonserrate.unimonpark.enums.EstadoMensualidad;
import co.edu.unimonserrate.unimonpark.enums.TipoCalculoTarifa;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoDisponibleException;
import co.edu.unimonserrate.unimonpark.exception.RecursoNoEncontradoException;
import co.edu.unimonserrate.unimonpark.repository.MatriculaUsuarioRepository;
import co.edu.unimonserrate.unimonpark.repository.MensualidadUsuarioRepository;
import co.edu.unimonserrate.unimonpark.repository.SalarioUsuarioRepository;
import co.edu.unimonserrate.unimonpark.repository.TarifaRepository;
import co.edu.unimonserrate.unimonpark.repository.UsuarioRepository;
import co.edu.unimonserrate.unimonpark.repository.VehiculoRepository;
import co.edu.unimonserrate.unimonpark.service.MensualidadUsuarioService;

@Service
public class MensualidadUsuarioServiceImpl implements MensualidadUsuarioService {

    private final MensualidadUsuarioRepository mensualidadRepository;
    private final UsuarioRepository usuarioRepository;
    private final VehiculoRepository vehiculoRepository;
    private final TarifaRepository tarifaRepository;
    private final MatriculaUsuarioRepository matriculaRepository;
    private final SalarioUsuarioRepository salarioRepository;

    public MensualidadUsuarioServiceImpl(
            MensualidadUsuarioRepository mensualidadRepository,
            UsuarioRepository usuarioRepository,
            VehiculoRepository vehiculoRepository,
            TarifaRepository tarifaRepository,
            MatriculaUsuarioRepository matriculaRepository,
            SalarioUsuarioRepository salarioRepository) {
        this.mensualidadRepository = mensualidadRepository;
        this.usuarioRepository = usuarioRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.tarifaRepository = tarifaRepository;
        this.matriculaRepository = matriculaRepository;
        this.salarioRepository = salarioRepository;
    }

    @Override
    public List<MensualidadResponseDTO> listar() {
        return mensualidadRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    public MensualidadResponseDTO buscarPorId(Long id) {
        return convertirADTO(mensualidadRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Mensualidad no encontrada con id: " + id)));
    }

    @Auditable(tabla = "mensualidades_usuario", operacion = co.edu.unimonserrate.unimonpark.enums.TipoOperacion.CREAR)
    @Transactional
    @Override
    public MensualidadResponseDTO crear(MensualidadRequestDTO dto) {
        if (dto.getFechaFin().isBefore(dto.getFechaInicio())) {
            throw new RecursoNoDisponibleException("La fecha de fin no puede ser anterior a la fecha de inicio");
        }

        Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + dto.getIdUsuario()));
        Vehiculo vehiculo = vehiculoRepository.findById(dto.getIdVehiculo())
                .orElseThrow(() -> new RecursoNoEncontradoException("Vehículo no encontrado con id: " + dto.getIdVehiculo()));
        Tarifa tarifa = tarifaRepository.findById(dto.getIdTarifa())
                .orElseThrow(() -> new RecursoNoEncontradoException("Tarifa no encontrada con id: " + dto.getIdTarifa()));

        validarPropiedadYPerfil(usuario, vehiculo, tarifa);
        if (mensualidadRepository.buscarSolapadas(usuario.getIdUsuario(), vehiculo.getIdVehiculo(),
                dto.getFechaInicio(), dto.getFechaFin(), EstadoMensualidad.ACTIVA).size() > 0) {
            throw new RecursoNoDisponibleException("Ya existe una mensualidad activa para el vehículo en ese periodo");
        }

        BigDecimal valorCalculado = calcularValor(usuario, vehiculo, tarifa, dto.getFechaInicio(), dto.getFechaFin());
        MensualidadUsuario mensualidad = new MensualidadUsuario();
        mensualidad.setUsuario(usuario);
        mensualidad.setVehiculo(vehiculo);
        mensualidad.setTarifa(tarifa);
        mensualidad.setFechaInicio(dto.getFechaInicio());
        mensualidad.setFechaFin(dto.getFechaFin());
        mensualidad.setValorCalculado(valorCalculado);
        mensualidad.setEstado(EstadoMensualidad.ACTIVA);
        mensualidad.setFechaCreacion(LocalDateTime.now());
        return convertirADTO(mensualidadRepository.save(mensualidad));
    }

    private void validarPropiedadYPerfil(Usuario usuario, Vehiculo vehiculo, Tarifa tarifa) {
        if (!vehiculo.getUsuario().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new RecursoNoDisponibleException("El vehículo no pertenece al usuario seleccionado");
        }
        if (tarifa.getTipoCalculo() != TipoCalculoTarifa.MENSUAL) {
            throw new RecursoNoDisponibleException("La tarifa seleccionada no es de planilla");
        }
        if (tarifa.getTipoVehiculo() != null
                && !tarifa.getTipoVehiculo().getIdTipoVehiculo().equals(vehiculo.getTipoVehiculo().getIdTipoVehiculo())) {
            throw new RecursoNoDisponibleException("La tarifa no corresponde al tipo de vehículo");
        }
    }

    private BigDecimal calcularValor(Usuario usuario, Vehiculo vehiculo, Tarifa tarifa,
            LocalDate fechaInicio, LocalDate fechaFin) {
        if (Boolean.TRUE.equals(usuario.getVoluntarioCentroObrero())
                || "BICICLETA".equalsIgnoreCase(vehiculo.getTipoVehiculo().getNombre())) {
            return BigDecimal.ZERO.setScale(2);
        }
        BigDecimal valor = tarifa.getValorHora();
        if (valor == null) {
            throw new RecursoNoDisponibleException("La tarifa de planilla no tiene un valor parametrizado");
        }
        BigDecimal base = obtenerBase(usuario, fechaInicio, fechaFin);
        return base.multiply(valor).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal obtenerBase(Usuario usuario, LocalDate fechaInicio, LocalDate fechaFin) {
        if (usuario.getPerfilUsuarioTarifa() == null) {
            throw new RecursoNoDisponibleException("El usuario no tiene perfil tarifario");
        }
        String perfil = usuario.getPerfilUsuarioTarifa().getNombre();
        if ("ESTUDIANTE".equalsIgnoreCase(perfil)) {
            return matriculaRepository.buscarVigente(usuario.getIdUsuario(), fechaInicio, fechaFin)
                    .map(MatriculaUsuario::getValor)
                    .orElseThrow(() -> new RecursoNoDisponibleException("No existe matrícula vigente para el periodo"));
        }
        return salarioRepository.buscarVigente(usuario.getIdUsuario(), fechaInicio, fechaFin)
                .map(SalarioUsuario::getValor)
                .orElseThrow(() -> new RecursoNoDisponibleException("No existe salario vigente para el periodo"));
    }

    private MensualidadResponseDTO convertirADTO(MensualidadUsuario mensualidad) {
        MensualidadResponseDTO dto = new MensualidadResponseDTO();
        dto.setIdMensualidadUsuario(mensualidad.getIdMensualidadUsuario());
        dto.setIdUsuario(mensualidad.getUsuario().getIdUsuario());
        dto.setIdVehiculo(mensualidad.getVehiculo().getIdVehiculo());
        dto.setPlacaVehiculo(mensualidad.getVehiculo().getPlaca());
        dto.setIdTarifa(mensualidad.getTarifa().getIdTarifa());
        dto.setNombreTarifa(mensualidad.getTarifa().getNombre());
        dto.setFechaInicio(mensualidad.getFechaInicio());
        dto.setFechaFin(mensualidad.getFechaFin());
        dto.setValorCalculado(mensualidad.getValorCalculado());
        dto.setEstado(mensualidad.getEstado());
        dto.setFechaCreacion(mensualidad.getFechaCreacion());
        return dto;
    }
}
