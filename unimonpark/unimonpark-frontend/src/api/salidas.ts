import apiClient from "./client";
import type { Salida, SalidaPayload } from "@/types/salida";

const ruta = "/salidas";

function normalizarSalida(item: Salida): Salida {
    const registro = item as unknown as Record<string, unknown>;
    return {
        idSalida: Number(registro.idSalida ?? registro.id_salida),
        idIngreso: Number(registro.idIngreso ?? registro.id_ingreso),
        fechaSalida: String(registro.fechaSalida ?? registro.fecha_salida ?? ""),
        lecturaFinalKm: registro.lecturaFinalKm == null && registro.lectura_final_km == null
            ? null
            : Number(registro.lecturaFinalKm ?? registro.lectura_final_km),
        tiempoPermanencia: registro.tiempoPermanencia == null && registro.tiempo_permanencia == null
            ? null
            : Number(registro.tiempoPermanencia ?? registro.tiempo_permanencia),
        valorTotal: Number(registro.valorTotal ?? registro.valor_total),
        observaciones: (registro.observaciones ?? null) as string | null,
        estado: String(registro.estado ?? ""),
        idTarifa: Number(registro.idTarifa ?? registro.id_tarifa),
    };
}

export async function listarSalidas(): Promise<Salida[]> {
    const response = await apiClient.get<Salida[] | { data?: Salida[]; content?: Salida[] }>(ruta);
    const body = response.data;
    const items = Array.isArray(body) ? body : body.data ?? body.content ?? [];
    return items.map(normalizarSalida);
}

export async function crearSalida(salida: SalidaPayload): Promise<Salida> {
    const response = await apiClient.post<Salida>(ruta, salida);
    return normalizarSalida(response.data);
}
