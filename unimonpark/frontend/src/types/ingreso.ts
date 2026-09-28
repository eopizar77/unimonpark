export type TipoIngreso = "NORMAL" | "AUTORIZADO" | "MENSUAL" | "VIP";
export type EstadoIngreso = "ACTIVO" | "FINALIZADO";

export interface Ingreso {
    idIngreso: number;
    fechaIngreso: string;
    lecturaInicialKm: number | null;
    tipoIngreso: TipoIngreso;
    estado: EstadoIngreso;
    idVehiculo: number;
    idEspacioParqueo: number;
    numeroFicha: string | null;
}

export interface IngresoPayload {
    lecturaInicialKm: number | null;
    tipoIngreso: TipoIngreso;
    estado: EstadoIngreso;
    idVehiculo: number;
    idEspacioParqueo: number;
    numeroFicha: string | null;
}