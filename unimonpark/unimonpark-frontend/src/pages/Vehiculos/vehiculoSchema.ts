import { z } from "zod";

export const vehiculoSchema = z.object({
    idUsuario: z.number({message: "El usuario es obligatorio"}),
    idTipoVehiculo: z.number().int().positive("Selecciona un tipo de vehículo"),
    placa: z.string().trim().optional(),
    marca: z.string().max(255).optional(),
    modelo: z.string().max(255).optional(),
    color: z.string().max(255).optional(),
    categoriaPersona: z.enum(["ESTUDIANTE","DOCENTE_ADMINISTRATIVO_EXTERNO","CENTRO_OBRERO"],{
        message:"La categoria es obligatoria"
    }),
    activo: z.boolean(),
});

export type VehiculoFormValues = z.infer<typeof vehiculoSchema>;