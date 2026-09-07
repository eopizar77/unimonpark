export interface Salida {
    idSalida: number;
    idIngreso: number;
    fechaSalida: string;
    lecturaFinalKm: number | null;
    tiempoPermanencia: number | null;
    valorTotal: number;
    observaciones: string | null;
    estado: string;
    idTarifa: number;
}

export interface SalidaPayload {
    idIngreso: number;
    lecturaFinalKm: number | null;
    tiempoPermanencia: number | null;
    valorTotal: number;
    observaciones: string;
    estado: string;
    idTarifa: number;
}
