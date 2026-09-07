export interface EspacioParqueo {
    idEspacio: number;
    codigo: string;
    piso: string | null;
    zona: string | null;
    estado: string;
    activo: boolean;
    idTipoVehiculo: number;
}

export interface EspacioParqueoPayload {
    codigo: string;
    piso: string;
    zona: string;
    estado: string;
    activo: boolean;
    idTipoVehiculo: number;
}
