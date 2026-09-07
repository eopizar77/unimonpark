import apiClient from "./client";
import type { EspacioParqueo, EspacioParqueoPayload } from "@/types/espacioParqueo";

const ruta = "/espacios-parqueo";

export async function listarEspaciosParqueo(): Promise<EspacioParqueo[]> {
    const response = await apiClient.get<EspacioParqueo[] | { data?: EspacioParqueo[]; content?: EspacioParqueo[] }>(ruta);
    const body = response.data;
    if (Array.isArray(body)) return body;
    return body.data ?? body.content ?? [];
}

export async function crearEspacioParqueo(espacio: EspacioParqueoPayload): Promise<EspacioParqueo> {
    const response = await apiClient.post<EspacioParqueo>(ruta, espacio);
    return response.data;
}

export async function actualizarEspacioParqueo(
    id: number,
    espacio: EspacioParqueoPayload,
): Promise<EspacioParqueo> {
    const response = await apiClient.put<EspacioParqueo>(`${ruta}/${id}`, espacio);
    return response.data;
}

export async function eliminarEspacioParqueo(id: number): Promise<void> {
    await apiClient.delete(`${ruta}/${id}`);
}
