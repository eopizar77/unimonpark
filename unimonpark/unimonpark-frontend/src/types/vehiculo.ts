export type CategoriaPersona =
    | "ESTUDIANTE"
    | "DOCENTE_ADMINISTRATIVO"
    | "DOCENTE_ADMINISTRATIVO_EXTERNO"
    | "CENTRO_OBRERO"
    | "EXTERNO";

export interface Vehiculo {
    idVehiculo: number;
    idUsuario: number | null;
    nombreUsuario?: string | null;
    idExterno?: number | null;
    nombreExterno?: string | null;
    documentoExterno?: string | null;
    idTipoVehiculo: number;
    nombreTipoVehiculo?: string | null;
    placa: string | null;
    numeroFicha?: string | null;
    marca: string | null;
    modelo: string | null;
    color: string | null;
    categoriaPersona: CategoriaPersona;
    activo: boolean;
    fechaCreacion?: string;
}

export interface VehiculoPayload {
    idUsuario?: number | null;
    idExterno?: number | null;
    idTipoVehiculo: number;
    placa: string | null;
    marca: string;
    modelo: string;
    color: string;
    categoriaPersona: CategoriaPersona;
    activo: boolean;
}