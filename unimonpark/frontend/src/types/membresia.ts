export interface Membresia {
  idMembresia: number;
  idVehiculo: number;
  placaVehiculo: string;
  idTarifa: number;
  nombreTarifa: string;
  fechaInicio: string;
  fechaFin: string;
  montoPagado: number;
  activa: boolean;
}

export type MembresiaPayload = {
  idVehiculo: number;
  idTarifa: number;
};