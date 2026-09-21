import apiClient from "./client";
import type { Tarifa, TarifaPayload } from "@/types/tarifa";

const ruta = "/tarifas";

function normalizarTarifa(item: Tarifa): Tarifa {
    const registro = item as unknown as Record<string, unknown>;
    return {
        idTarifa: Number(registro.idTarifa ?? registro.id_tarifa),
        idTipoVehiculo: Number(registro.idTipoVehiculo ?? registro.id_tipo_vehiculo),
        nombreTipoVehiculo: String(registro.nombreTipoVehiculo ?? registro.nombre_tipo_vehiculo ?? ""),
        nombre: String(registro.nombre ?? ""),
        valorHora: registro.valorHora == null && registro.valor_hora == null
            ? null
            : Number(registro.valorHora ?? registro.valor_hora),
        categoriaPersona: (registro.categoriaPersona ?? registro.categoria_persona ?? null) as Tarifa["categoriaPersona"],
        tipoCalculo: (registro.tipoCalculo ?? registro.tipo_calculo) as Tarifa["tipoCalculo"],
        horasLimite: registro.horasLimite == null && registro.horas_limite == null
            ? null
            : Number(registro.horasLimite ?? registro.horas_limite),
        valorHastaLimite: registro.valorHastaLimite == null && registro.valor_hasta_limite == null
            ? null
            : Number(registro.valorHastaLimite ?? registro.valor_hasta_limite),
        valorDespuesLimite: registro.valorDespuesLimite == null && registro.valor_despues_limite == null
            ? null
            : Number(registro.valorDespuesLimite ?? registro.valor_despues_limite),
        porcentaje: registro.porcentaje == null ? null : Number(registro.porcentaje),
        activo: Boolean(registro.activo),
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
