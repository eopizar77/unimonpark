import apiClient from "./client";
import type { Rol } from "@/types/rol";

export async function listarRoles(): Promise<Rol[]>{
    const response = await apiClient.get<Rol[]>("/roles");
    return response.data;
}

export async function crearRol(rol: Omit<Rol, "idRol">): Promise<Rol>{
    const response = await apiClient.post<Rol>("/roles", rol);
    return response.data;
}

export async function actualizarRol(id: number, rol: Omit<Rol, "idRol">): Promise<Rol>{
    const response = await apiClient.put<Rol>(`/roles/${id}`, rol);
    return response.data;
}

export async function eliminarRol(id: number): Promise<void>{
    await apiClient.delete(`/roles/${id}`);
}