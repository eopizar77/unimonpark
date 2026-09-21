import { z } from "zod";

export const membresiaSchema = z.object({
  idVehiculo: z.number({ message: "El vehículo es obligatorio" }),
  idTarifa: z.number({ message: "La tarifa es obligatoria" }),
});

export type MembresiaFormValues = z.infer<typeof membresiaSchema>;