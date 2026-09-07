import apiClient from "./client";
import type { Vehiculo, VehiculoPayload } from "@/types/vehiculo";

const ruta = "/vehiculos";

export async function listarVehiculos(): Promise<Vehiculo[]> {
    const response = await apiClient.get<Vehiculo[]>(ruta);
    return response.data;
}

export async function crearVehiculo(vehiculo: VehiculoPayload): Promise<Vehiculo> {
    const response = await apiClient.post<Vehiculo>(ruta, vehiculo);
    return response.data;
}

export async function actualizarVehiculo(id: number, vehiculo: VehiculoPayload): Promise<Vehiculo> {
    const response = await apiClient.put<Vehiculo>(`${ruta}/${id}`, vehiculo);
    return response.data;
}

export async function eliminarVehiculo(id: number): Promise<void> {
    await apiClient.delete(`${ruta}/${id}`);
}
