export interface Tarifa {
    idTarifa: number;
    idTipoVehiculo: number;
    nombre: string;
    valorHora: number;
    valorDiurno: number | null;
    valorNocturno: number | null;
    horaInicioNocturna: string | null;
    horaFinNocturna: string | null;
    activo: boolean;
    fechaCreacion?: string;
}

export interface TarifaPayload {
    idTipoVehiculo: number;
    nombre: string;
    valorHora: number;
    valorDiurno: number | null;
    valorNocturno: number | null;
    horaInicioNocturna: string | null;
    horaFinNocturna: string | null;
    activo: boolean;
}
