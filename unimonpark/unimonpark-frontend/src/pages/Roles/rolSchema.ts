import { z } from "zod";

export const rolSchema = z.object({
    nombre: z.string().min(1, "Elnombre de Rol es obligatorio").max(50, "Maximo 50 caracteres"),
    descripcion: z.string().max(150, "Maximo 150 caracteres").optional(),
    activo: z.boolean(),
});

export type RolFormValues = z.infer<typeof rolSchema>;