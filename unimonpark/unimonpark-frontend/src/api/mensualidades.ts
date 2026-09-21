import apiClient from "./client";
import type { Mensualidad, MensualidadPayload } from "@/types/mensualidad";

const ruta = "/mensualidades";

export async function listarMensualidades(): Promise<Mensualidad[]> {
    const response = await apiClient.get<Mensualidad[] | { data?: Mensualidad[]; content?: Mensualidad[] }>(ruta);
    const body = response.data;
    const items = Array.isArray(body) ? body : body.data ?? body.content ?? [];
    return items;
}

export async function crearMensualidad(payload: MensualidadPayload): Promise<Mensualidad> {
    const response = await apiClient.post<Mensualidad>(ruta, payload);
    return response.data;
}
