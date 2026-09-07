import apiClient from "./client";
import type { Tarifa, TarifaPayload } from "@/types/tarifa";

const ruta = "/tarifas";

function normalizarTarifa(item: Tarifa): Tarifa {
    const registro = item as unknown as Record<string, unknown>;
    return {
        idTarifa: Number(registro.idTarifa ?? registro.id_tarifa),
        idTipoVehiculo: Number(registro.idTipoVehiculo ?? registro.id_tipo_vehiculo),
        nombre: String(registro.nombre ?? ""),
        valorHora: Number(registro.valorHora ?? registro.valor_hora),
        valorDiurno: registro.valorDiurno == null && registro.valor_diurno == null
            ? null
            : Number(registro.valorDiurno ?? registro.valor_diurno),
        valorNocturno: registro.valorNocturno == null && registro.valor_nocturno == null
            ? null
            : Number(registro.valorNocturno ?? registro.valor_nocturno),
        horaInicioNocturna: (registro.horaInicioNocturna ?? registro.hora_inicio_nocturna ?? null) as string | null,
        horaFinNocturna: (registro.horaFinNocturna ?? registro.hora_fin_nocturna ?? null) as string | null,
        activo: Boolean(registro.activo),
        fechaCreacion: (registro.fechaCreacion ?? registro.fecha_creacion) as string | undefined,
    };
}

export async function listarTarifas(): Promise<Tarifa[]> {
    const response = await apiClient.get<Tarifa[] | { data?: Tarifa[]; content?: Tarifa[] }>(ruta);
    const body = response.data;
    const items = Array.isArray(body) ? body : body.data ?? body.content ?? [];
    return items.map(normalizarTarifa);
}

export async function crearTarifa(tarifa: TarifaPayload): Promise<Tarifa> {
    const response = await apiClient.post<Tarifa>(ruta, tarifa);
    return response.data;
}

export async function actualizarTarifa(id: number, tarifa: TarifaPayload): Promise<Tarifa> {
    const response = await apiClient.put<Tarifa>(`${ruta}/${id}`, tarifa);
    return response.data;
}

export async function eliminarTarifa(id: number): Promise<void> {
    await apiClient.delete(`${ruta}/${id}`);
}
