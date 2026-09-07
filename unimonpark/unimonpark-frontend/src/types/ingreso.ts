export interface Ingreso {
    idIngreso: number;
    fechaIngreso: string;
    lecturaInicialKm: number | null;
    tipoIngreso: string;
    estado: string;
    idVehiculo: number;
    idEspacioParqueo: number;
}

export interface IngresoPayload {
    lecturaInicialKm: number | null;
    tipoIngreso: string;
    estado: string;
    idVehiculo: number;
    idEspacioParqueo: number;
}
