import api from "./config";

export interface SincronizacionResponse {
    documento: string;
    nombres: string;
    apellidos: string;
    correo: string;
    activo: boolean;
    rolOriginal: string;
    idRol: number | null;
    esExterno: boolean;
}

export const consultarSincronizacion = async (documento: string): Promise<SincronizacionResponse> => {
    const response = await api.get(`/sincronizacion/${documento}`);
    return response.data;
};
