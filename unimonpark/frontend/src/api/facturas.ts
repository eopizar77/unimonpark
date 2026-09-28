import apiClient from "./client";
import type { Factura, FacturaPayload } from "@/types/factura";

const ruta = "/facturas";

function normalizarFactura(item: Factura): Factura {
    const registro = item as unknown as Record<string, unknown>;
    return {
        idFactura: Number(registro.idFactura ?? registro.id_factura),
        idUsuario: Number(registro.idUsuario ?? registro.id_usuario),
        nombres: String(registro.nombres ?? registro.nombres),
        apellidos: String(registro.apellidos ?? registro.apellidos),
        fecha: String(registro.fecha ?? ""),
        subtotal: Number(registro.subtotal ?? 0),
        descuento: registro.descuento == null ? null : Number(registro.descuento),
        iva: registro.iva == null ? null : Number(registro.iva),
        total: Number(registro.total ?? 0),
        estado: String(registro.estado ?? ""),
        idSalida: Number(registro.idSalida ?? registro.id_salida),
        idTarifa: String(registro.idTarifa ?? registro.id_tarifa),
        nombreTarifa: String(registro.nombreTarifa ?? registro.nombre_tarifa),
        placaVehiculo: String(registro.placaVehiculo ?? registro.placa_vehiculo),
        tipoVehiculo: String(registro.tipoVehiculo ?? registro.tipo_vehiculo ?? ""),
        categoriaPersona: String(registro.categoriaPersona ?? registro.categoria_persona ?? ""),
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

export interface FiltrosFactura {
    desde?: string;
    hasta?: string;
    categoriaPersona?: string;
    usuario?: string;
}

export async function buscarFacturas(filtros: FiltrosFactura): Promise<Factura[]> {
    const response = await apiClient.get<Factura[] | { data?: Factura[]; content?: Factura[] }>(`${ruta}/buscar`, {
        params: {
            desde: filtros.desde ? `${filtros.desde}T00:00:00` : undefined,
            hasta: filtros.hasta ? `${filtros.hasta}T23:59:59` : undefined,
            categoriaPersona: filtros.categoriaPersona || undefined,
            usuario: filtros.usuario || undefined,
        },
    });
    const body = response.data;
    const items = Array.isArray(body) ? body : body.data ?? body.content ?? [];
    return items.map(normalizarFactura);
}
