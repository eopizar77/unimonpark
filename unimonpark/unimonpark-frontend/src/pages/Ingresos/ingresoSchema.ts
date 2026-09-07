import { z } from "zod";

export const ingresoSchema = z.object({
    idVehiculo: z.number().int().positive("Selecciona un vehículo"),
    idEspacioParqueo: z.number().int().positive("Selecciona un espacio de parqueo"),
    lecturaInicialKm: z.number().int().nonnegative("La lectura no puede ser negativa").nullable(),
    tipoIngreso: z.string().trim().min(1, "El tipo de ingreso es obligatorio").max(255),
});

export type IngresoFormValues = z.infer<typeof ingresoSchema>;
