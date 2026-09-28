import { z } from "zod";

export const penalizacionSchema = z.object({
  idVehiculo: z.number({ message: "El vehículo es obligatorio" }),
  tipo: z.enum(["TICKET_PERDIDO", "FICHA_PERDIDA"], { message: "El tipo es obligatorio" }),
  observaciones: z.string().optional(),
});

export type PenalizacionFormValues = z.infer<typeof penalizacionSchema>;