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
