import axios from "axios";
import type { SincronizacionResponse } from "./sincronizacion";

const API_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://192.168.10.214:8080/api") + "/public";

// Usamos axios puro sin interceptores para no mandar token JWT
const publicApi = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export interface RegistroPublicoPayload {
    documento: string;
    nombres: string;
    apellidos: string;
    correo: string;
    idRol: number;
    tipoVehiculoId: number;
    placa?: string;
    marca: string;
    modelo: string;
    color: string;
}

export const sincronizarPublico = async (documento: string): Promise<SincronizacionResponse> => {
    const response = await publicApi.get(`/sincronizar/${documento}`);
    return response.data;
};

export const enviarRegistroPublico = async (data: RegistroPublicoPayload) => {
    const response = await publicApi.post(`/registro-vehiculo`, data);
    return response.data;
};
