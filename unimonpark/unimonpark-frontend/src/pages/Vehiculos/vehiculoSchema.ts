import { z } from "zod";

export const vehiculoSchema = z.object({
    idUsuario: z.number().int().positive().nullable(),
    idTipoVehiculo: z.number().int().positive("Selecciona un tipo de vehículo"),
    placa: z.string().trim().min(1, "La placa es obligatoria").max(255),
    marca: z.string().max(255).optional(),
    modelo: z.string().max(255).optional(),
    color: z.string().max(255).optional(),
    activo: z.boolean(),
});

export type VehiculoFormValues = z.infer<typeof vehiculoSchema>;
