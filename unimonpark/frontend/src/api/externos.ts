import apiClient from "./client";
import type { Externo, ExternoPayload } from "@/types/externo";

const ruta = "/externos";

export async function listarExternos(): Promise<Externo[]> {
    const response = await apiClient.get<Externo[] | { data?: Externo[]; content?: Externo[] }>(ruta);
    const body = response.data;
    const items = Array.isArray(body) ? body : body.data ?? body.content ?? [];
    return items;
}

export async function buscarExternoPorId(id: number): Promise<Externo> {
    const response = await apiClient.get<Externo>(`${ruta}/${id}`);
    return response.data;
}

export async function crearExterno(externo: ExternoPayload): Promise<Externo> {
    const response = await apiClient.post<Externo>(ruta, externo);
    return response.data;
}

export async function actualizarExterno(id: number, externo: ExternoPayload): Promise<Externo> {
    const response = await apiClient.put<Externo>(`${ruta}/${id}`, externo);
    return response.data;
}

export async function eliminarExterno(id: number): Promise<void> {
    await apiClient.delete(`${ruta}/${id}`);
}