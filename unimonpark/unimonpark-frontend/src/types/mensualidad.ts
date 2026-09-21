export type EstadoMensualidad = "ACTIVA" | "VENCIDA" | "ANULADA";

export interface Mensualidad {
    idMensualidadUsuario: number;
    idUsuario: number;
    idVehiculo: number;
    placaVehiculo: string;
    idTarifa: number;
    nombreTarifa: string;
    fechaInicio: string;
    fechaFin: string;
    valorCalculado: number;
    estado: EstadoMensualidad;
    fechaCreacion: string;
}

export interface MensualidadPayload {
    idUsuario: number;
    idVehiculo: number;
    idTarifa: number;
    fechaInicio: string;
    fechaFin: string;
}
