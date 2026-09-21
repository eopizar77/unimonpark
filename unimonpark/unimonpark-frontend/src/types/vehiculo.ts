export type CategoriaPersona = "ESTUDIANTE" | "DOCENTE_ADMINISTRATIVO_EXTERNO" | "CENTRO_OBRERO";

export interface Vehiculo {
    idVehiculo: number;
    idUsuario: number;
    idTipoVehiculo: number;
    placa: string | null;
    numeroFicha: string | null;
    marca: string | null;
    modelo: string | null;
    color: string | null;
    categoriaPersona: CategoriaPersona;
    activo: boolean;
    fechaCreacion?: string;
}

export interface VehiculoPayload {
    idUsuario: number;
    idTipoVehiculo: number;
    placa: string | null;
    marca: string;
    modelo: string;
    color: string;
    categoriaPersona: CategoriaPersona;
    activo: boolean;
}