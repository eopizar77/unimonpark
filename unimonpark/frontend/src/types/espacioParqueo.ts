export type EstadoEspacio = "DISPONIBLE" | "OCUPADO" | "RESERVADO" | "MANTENIMIENTO";

export interface EspacioParqueo {
    idEspacio: number;
    codigo: string;
    piso: string | null;
    zona: string | null;
    estado: EstadoEspacio;
    activo: boolean;
    idTipoVehiculo: number;
}

export interface EspacioParqueoPayload {
    codigo: string;
    piso: string;
    zona: string;
    estado: EstadoEspacio;
    activo: boolean;
    idTipoVehiculo: number;
}
