import apiClient from "./client";
import type { Factura, FacturaPayload } from "@/types/factura";

const ruta = "/facturas";

function normalizarFactura(item: Factura): Factura {
    const registro = item as unknown as Record<string, unknown>;
    return {
        idFactura: Number(registro.idFactura ?? registro.id_factura),
        idUsuario: Number(registro.idUsuario ?? registro.id_usuario),
        fecha: String(registro.fecha ?? ""),
        subtotal: Number(registro.subtotal ?? 0),
        descuento: registro.descuento == null ? null : Number(registro.descuento),
        iva: registro.iva == null ? null : Number(registro.iva),
        total: Number(registro.total ?? 0),
        estado: String(registro.estado ?? ""),
        idSalida: Number(registro.idSalida ?? registro.id_salida),
    };
}

export async function listarFacturas(): Promise<Factura[]> {
    const response = await apiClient.get<Factura[] | { data?: Factura[]; content?: Factura[] }>(ruta);
    const body = response.data;
    const items = Array.isArray(body) ? body : body.data ?? body.content ?? [];
    return items.map(normalizarFactura);
}

export async function crearFactura(factura: FacturaPayload): Promise<Factura> {
    const response = await apiClient.post<Factura>(ruta, factura);
    return normalizarFactura(response.data);
}
