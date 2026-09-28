import { z } from "zod";

export const CATEGORIAS_PERSONA = [
    "ESTUDIANTE",
    "DOCENTE_ADMINISTRATIVO",
    "DOCENTE_ADMINISTRATIVO_EXTERNO",
    "CENTRO_OBRERO",
    "EXTERNO",
] as const;

export const vehiculoSchema = z
    .object({
        tipoPropietario: z.enum(["USUARIO", "EXTERNO"]),
        idUsuario: z.number().nullable().optional(),
        idExterno: z.number().nullable().optional(),
        idTipoVehiculo: z.number().int().positive("Selecciona un tipo de vehículo"),
        placa: z.string().trim().optional(),
        marca: z.string().max(255).optional(),
        modelo: z.string().max(255).optional(),
        color: z.string().max(255).optional(),
        categoriaPersona: z.enum(CATEGORIAS_PERSONA, {
            message: "La categoría es obligatoria",
        }),
        activo: z.boolean(),
    })
    .superRefine((valores, ctx) => {
        if (valores.tipoPropietario === "USUARIO") {
            if (!valores.idUsuario || valores.idUsuario <= 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["idUsuario"],
                    message: "Debes seleccionar un usuario institucional",
                });
            }
        } else if (valores.tipoPropietario === "EXTERNO") {
            if (!valores.idExterno || valores.idExterno <= 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["idExterno"],
                    message: "Debes seleccionar un usuario externo",
                });
            }
        }
    });

export type VehiculoFormValues = z.infer<typeof vehiculoSchema>;