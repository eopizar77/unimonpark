import { z } from "zod";

export const TIPOS_DOCUMENTO = ["CC", "TI", "CE", "PASAPORTE", "OTRO"] as const;

export const externoSchema = z.object({
    tipoDocumento: z.enum(TIPOS_DOCUMENTO, {
        message: "El tipo de documento es obligatorio",
    }),
    numeroDocumento: z
        .string()
        .trim()
        .min(1, "El número de documento es obligatorio")
        .max(50, "Máximo 50 caracteres"),
    nombres: z
        .string()
        .trim()
        .min(1, "Los nombres son obligatorios")
        .max(100, "Máximo 100 caracteres"),
    apellidos: z
        .string()
        .trim()
        .min(1, "Los apellidos son obligatorios")
        .max(100, "Máximo 100 caracteres"),
    telefono: z.string().trim().max(20, "Máximo 20 caracteres").optional().or(z.literal("")),
    correo: z
        .string()
        .trim()
        .email("Ingresa un correo electrónico válido")
        .optional()
        .or(z.literal("")),
    empresa: z.string().trim().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
    activo: z.boolean(),
});

export type ExternoFormValues = z.infer<typeof externoSchema>;
