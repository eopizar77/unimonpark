import apiClient from "./client";
import type { Membresia, MembresiaPayload } from "@/types/membresia";

const ruta = "/membresias";

export async function listarMembresias(): Promise<Membresia[]> {
  const response = await apiClient.get<Membresia[]>(ruta);
  return response.data;
}

export async function crearMembresia(membresia: MembresiaPayload): Promise<Membresia> {
  const response = await apiClient.post<Membresia>(ruta, membresia);
  return response.data;
}