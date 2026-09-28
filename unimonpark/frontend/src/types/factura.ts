export interface Factura {
    idFactura: number;
    idUsuario?: number | null;
    idExterno?: number | null;
    nombres: string;
    apellidos: string,
    fecha: string;
    subtotal: number;
    descuento: number | null;
    iva: number | null;
    total: number;
    estado: string;
    idSalida: number;
    idTarifa: string;
    nombreTarifa: string;
    placaVehiculo: string;
    tipoVehiculo: string;
    categoriaPersona: string;
}

export interface FacturaPayload {
    idUsuario?: number | null;
    idExterno?: number | null;
    descuento: number;
    iva: number;
    idSalida: number;
}
