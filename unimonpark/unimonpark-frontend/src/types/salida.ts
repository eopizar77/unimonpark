export type ModalidadPago = "POR_TIEMPO" | "POR_PLANILLA" | "ESPECIAL";
export type TipoIngreso = "NORMAL" | "AUTORIZADO" | "MENSUAL" | "VIP";

export interface Salida {
    idSalida: number;
    idIngreso: number;
    fechaIngreso: string;
    fechaSalida: string;
    lecturaFinalKm: number | null;
    tiempoPermanencia: number | null;
    valorTotal: number;
    observaciones: string | null;
    estado: string;
    idTarifa: number;
    modalidadPago: ModalidadPago | null;
    tipoIngreso: TipoIngreso | null;
    placaVehiculo: string;
    tipoVehiculo: string;
    nombreTarifa: string;
    
}

export interface SalidaPayload {
    idIngreso: number;
    lecturaFinalKm: number | null;
    observaciones: string;
    idTarifa: number | null;
    modalidadPago: ModalidadPago;
}
