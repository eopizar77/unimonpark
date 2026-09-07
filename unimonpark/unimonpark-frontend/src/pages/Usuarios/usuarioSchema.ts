import { z } from "zod";

export const usuarioSchema = z.object({
    nombres: z.string().trim().min(1, "Los nombres son obligatorios").max(255),
    apellidos: z.string().trim().min(1, "Los apellidos son obligatorios").max(255),
    documento: z.string().trim().min(1, "El documento es obligatorio").max(255),
    correo: z.string().trim().email("Ingresa un correo válido").max(255),
    telefono: z.string().max(255).optional(),
    nombreUsuario: z.string().trim().min(1, "El nombre de usuario es obligatorio").max(255),
    contrasena: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").optional(),
    idRol: z.number().int().positive("Selecciona un rol"),
    activo: z.boolean(),
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;
