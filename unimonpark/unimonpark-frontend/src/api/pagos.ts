import apiClient from "./client";
import type { Pago, PagoPayload } from "@/types/pago";

const ruta = "/pagos";

function normalizarPago(item: Pago): Pago {
    const registro = item as unknown as Record<string, unknown>;
    return {
        idPago: Number(registro.idPago ?? registro.id_pago),
        idFactura: Number(registro.idFactura ?? registro.id_factura),
        fecha: String(registro.fecha ?? ""),
        monto: Number(registro.monto ?? 0),
        metodoPago: String(registro.metodoPago ?? registro.metodo_pago ?? ""),
        referencia: (registro.referencia ?? null) as string | null,
        estado: String(registro.estado ?? ""),
    };
}

export async function listarPagos(): Promise<Pago[]> {
    const response = await apiClient.get<Pago[] | { data?: Pago[]; content?: Pago[] }>(ruta);
    const body = response.data;
    const items = Array.isArray(body) ? body : body.data ?? body.content ?? [];
    return items.map(normalizarPago);
}

export async function crearPago(pago: PagoPayload): Promise<Pago> {
    const response = await apiClient.post<Pago>(ruta, pago);
    return normalizarPago(response.data);
}

export interface FiltrosPago {
    desde?: string;
    hasta?: string;
    metodoPago?: string;
    usuario?: string;
}

export async function buscarPagos(filtros: FiltrosPago): Promise<Pago[]> {
    const response = await apiClient.get<Pago[] | { data?: Pago[]; content?: Pago[] }>(`${ruta}/buscar`, {
        params: {
            desde: filtros.desde ? `${filtros.desde}T00:00:00` : undefined,
            hasta: filtros.hasta ? `${filtros.hasta}T23:59:59` : undefined,
            metodoPago: filtros.metodoPago || undefined,
            usuario: filtros.usuario || undefined,
        },
    });
    const body = response.data;
    const items = Array.isArray(body) ? body : body.data ?? body.content ?? [];
    return items.map(normalizarPago);
}