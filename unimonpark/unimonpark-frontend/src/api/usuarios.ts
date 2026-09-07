import apiClient from "./client";
import type { Usuario, UsuarioPayload } from "@/types/usuario";

const ruta = "/usuarios";

export async function listarUsuarios(): Promise<Usuario[]> {
    const response = await apiClient.get<Usuario[]>(ruta);
    return response.data;
}

export async function crearUsuario(usuario: UsuarioPayload): Promise<Usuario> {
    const response = await apiClient.post<Usuario>(ruta, usuario);
    return response.data;
}

export async function actualizarUsuario(id: number, usuario: UsuarioPayload): Promise<Usuario> {
    const response = await apiClient.put<Usuario>(`${ruta}/${id}`, usuario);
    return response.data;
}

export async function eliminarUsuario(id: number): Promise<void> {
    await apiClient.delete(`${ruta}/${id}`);
}
