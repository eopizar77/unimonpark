import apiClient from "./client";
import type { Penalizacion, PenalizacionPayload } from "@/types/penalizaciones";

const ruta = "/penalizaciones";

export async function listarPenalizaciones(): Promise<Penalizacion[]> {
  const response = await apiClient.get<Penalizacion[]>(ruta);
  return response.data;
}

export async function crearPenalizacion(p: PenalizacionPayload): Promise<Penalizacion> {
  const response = await apiClient.post<Penalizacion>(ruta, p);
  return response.data;
}

export async function marcarPenalizacionPagada(id: number): Promise<Penalizacion> {
  const response = await apiClient.put<Penalizacion>(`${ruta}/${id}/pagar`, {});
  return response.data;
}