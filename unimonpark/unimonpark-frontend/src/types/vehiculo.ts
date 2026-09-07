export interface Vehiculo {
    idVehiculo: number;
    idUsuario: number | null;
    idTipoVehiculo: number;
    placa: string;
    marca: string | null;
    modelo: string | null;
    color: string | null;
    activo: boolean;
    fechaCreacion?: string;
}

export interface VehiculoPayload {
    idUsuario: number | null;
    idTipoVehiculo: number;
    placa: string;
    marca: string;
    modelo: string;
    color: string;
    activo: boolean;
}
