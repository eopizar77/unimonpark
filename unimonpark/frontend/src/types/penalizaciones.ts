export type TipoPenalizacion = "TICKET_PERDIDO" | "FICHA_PERDIDA";
export type EstadoPenalizacion = "PENDIENTE" | "PAGADA";

export interface Penalizacion {
  idPenalizacion: number;
  idVehiculo: number;
  placaVehiculo: string;
  tipo: TipoPenalizacion;
  valor: number;
  estado: EstadoPenalizacion;
  fechaCreacion: string;
  fechaPago: string | null;
  observaciones: string | null;
}

export type PenalizacionPayload = {
  idVehiculo: number;
  tipo: TipoPenalizacion;
  observaciones?: string;
};