import apiClient from "./client";
import type { Membresia, MembresiaPayload } from "@/types/membresia";

const ruta = "/membresias";

export async function listarMembresias(): Promise<Membresia[]> {
  const response = await apiClient.get<Membresia[] | { data?: Membresia[]; content?: Membresia[] }>(ruta);
  const body = response.data;
  const items = Array.isArray(body) ? body : body.data ?? body.content ?? [];
  return items;
}

export async function crearMembresia(membresia: MembresiaPayload): Promise<Membresia> {
  const response = await apiClient.post<Membresia>(ruta, membresia);
  return response.data;
}

export async function editarMembresia(id: number, membresia: MembresiaPayload): Promise<Membresia> {
  const response = await apiClient.put<Membresia>(`${ruta}/${id}`, membresia);
  return response.data;
}