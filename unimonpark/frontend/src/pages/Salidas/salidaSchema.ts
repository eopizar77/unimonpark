import { z } from "zod";

export const salidaSchema = z.object({
    idIngreso: z.number().int().positive("Selecciona un ingreso"),
    lecturaFinalKm: z.number().int().nonnegative("La lectura no puede ser negativa").nullable(),
    observaciones: z.string().max(255).optional(),
    idTarifa: z.number().int().positive("Selecciona una tarifa").nullable(),
    modalidadPago: z.enum(["POR_TIEMPO", "POR_PLANILLA", "ESPECIAL"]),
});

export type SalidaFormValues = z.infer<typeof salidaSchema>;
