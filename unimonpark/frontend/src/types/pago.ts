export interface Pago {
    idPago: number;
    idFactura: number;
    fecha: string;
    monto: number;
    metodoPago: string;
    referencia: string | null;
    estado: string;
}

export interface PagoPayload {
    idFactura: number;
    monto: number;
    metodoPago: string;
    referencia: string;
    estado: string;
}
