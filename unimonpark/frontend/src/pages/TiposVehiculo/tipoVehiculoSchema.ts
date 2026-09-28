import { z } from "zod";

export const tipoVehiculoSchema = z.object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio").max(50, "Máximo 50 caracteres"),
    descripcion: z.string().max(150, "Máximo 150 caracteres").optional(),
    activo: z.boolean(),
});

export type TipoVehiculoFormValues = z.infer<typeof tipoVehiculoSchema>;
