import { z } from "zod";

export const mensualidadSchema = z.object({
    idUsuario: z.number().int().positive("Selecciona un usuario"),
    idVehiculo: z.number().int().positive("Selecciona un vehículo"),
    idTarifa: z.number().int().positive("Selecciona una tarifa"),
    fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fechaFin: z.string().min(1, "La fecha de fin es obligatoria"),
});

export type MensualidadFormValues = z.infer<typeof mensualidadSchema>;
