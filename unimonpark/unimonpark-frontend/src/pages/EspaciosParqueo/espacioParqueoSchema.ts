import { z } from "zod";

export const espacioParqueoSchema = z.object({
    codigo: z.string().trim().min(1, "El código es obligatorio").max(255),
    piso: z.string().max(255).optional(),
    zona: z.string().max(255).optional(),
    estado: z.enum(["DISPONIBLE", "OCUPADO", "RESERVADO", "MANTENIMIENTO"]),
    activo: z.boolean(),
    idTipoVehiculo: z.number().int().positive("Selecciona un tipo de vehículo"),
});

export type EspacioParqueoFormValues = z.infer<typeof espacioParqueoSchema>;
