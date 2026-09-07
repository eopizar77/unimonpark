export interface Factura {
    idFactura: number;
    idUsuario: number;
    fecha: string;
    subtotal: number;
    descuento: number | null;
    iva: number | null;
    total: number;
    estado: string;
    idSalida: number;
}

export interface FacturaPayload {
    idUsuario: number;
    subtotal: number;
    descuento: number;
    iva: number;
    total: number;
    estado: string;
    idSalida: number;
}
