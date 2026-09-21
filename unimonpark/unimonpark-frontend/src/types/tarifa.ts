export type TipoCalculoTarifa = "POR_HORA" | "POR_TRAMOS" | "PLANA" | "MENSUAL";
export type CategoriaPersona = "ESTUDIANTE" | "DOCENTE_ADMINISTRATIVO_EXTERNO" | "CENTRO_OBRERO";
export type TarifaPayload = Omit<Tarifa, "idTarifa" | "nombreTipoVehiculo">;

export interface Tarifa {
    idTarifa: number;
    nombre: string;
    valorHora: number | null;
    activo: boolean;
    idTipoVehiculo: number;
    nombreTipoVehiculo: string;
    categoriaPersona: CategoriaPersona | null;
    tipoCalculo: TipoCalculoTarifa;
    horasLimite: number | null;
    valorHastaLimite: number | null;
    valorDespuesLimite: number | null;
    porcentaje: number | null;
}

/*export interface TarifaPayload {
    idTipoVehiculo: number;
    nombre: string;
    valorHora: number;
    valorDiurno: number | null;
    valorNocturno: number | null;
    horaInicioNocturna: string | null;
    horaFinNocturna: string | null;
    activo: boolean;
}*/


