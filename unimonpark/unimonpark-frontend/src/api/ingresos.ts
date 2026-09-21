import apiClient from "./client";
import type { Ingreso, IngresoPayload } from "@/types/ingreso";

const ruta = "/ingresos";

export async function listarIngresos(): Promise<Ingreso[]> {
    const response = await apiClient.get<Ingreso[] | { data?: Ingreso[]; content?: Ingreso[] }>(ruta);
    const body = response.data;
    if (Array.isArray(body)) return body;
    return body.data ?? body.content ?? [];
}

export async function crearIngreso(ingreso: IngresoPayload): Promise<Ingreso> {
    const response = await apiClient.post<Ingreso>(ruta, ingreso);
    return response.data;
}

export interface FiltrosIngreso {
    desde?: string;
    hasta?: string;
    tipoVehiculo?: string;
    usuario?: string;
}

export async function buscarIngresos(filtros: FiltrosIngreso): Promise<Ingreso[]> {
    const response = await apiClient.get<Ingreso[] | { data?: Ingreso[]; content?: Ingreso[] }>(`${ruta}/buscar`, {
        params: {
            desde: filtros.desde ? `${filtros.desde}T00:00:00` : undefined,
            hasta: filtros.hasta ? `${filtros.hasta}T23:59:59` : undefined,
            tipoVehiculo: filtros.tipoVehiculo || undefined,
            usuario: filtros.usuario || undefined,
        },
    });
    const body = response.data;
    if (Array.isArray(body)) return body;
    return body.data ?? body.content ?? [];
}
