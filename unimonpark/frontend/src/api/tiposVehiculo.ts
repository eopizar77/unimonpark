import apiClient from "./client";
import type { TipoVehiculo } from "@/types/tipoVehiculo";

const ruta = "/tipos-vehiculo";
type TipoVehiculoPayload = Omit<TipoVehiculo, "idTipoVehiculo">;

function normalizarTipoVehiculo(item: TipoVehiculo): TipoVehiculo {
    const registro = item as unknown as Record<string, unknown>;
    return {
        idTipoVehiculo: Number(registro.idTipoVehiculo ?? registro.id_tipo_vehiculo),
        nombre: String(registro.nombre ?? ""),
        descripcion: String(registro.descripcion ?? ""),
        activo: Boolean(registro.activo),
    };
}

export async function listarTiposVehiculo(): Promise<TipoVehiculo[]> {
    const response = await apiClient.get<TipoVehiculo[] | { data?: TipoVehiculo[]; content?: TipoVehiculo[] }>(ruta);
    const body = response.data;
    const items = Array.isArray(body) ? body : body.data ?? body.content ?? [];
    return items.map(normalizarTipoVehiculo);
}

export async function crearTipoVehiculo(tipo: TipoVehiculoPayload): Promise<TipoVehiculo> {
    const response = await apiClient.post<TipoVehiculo>(ruta, tipo);
    return response.data;
}

export async function actualizarTipoVehiculo(
    id: number,
    tipo: TipoVehiculoPayload,
): Promise<TipoVehiculo> {
    const response = await apiClient.put<TipoVehiculo>(`${ruta}/${id}`, tipo);
    return response.data;
}

export async function eliminarTipoVehiculo(id: number): Promise<void> {
    await apiClient.delete(`${ruta}/${id}`);
}
