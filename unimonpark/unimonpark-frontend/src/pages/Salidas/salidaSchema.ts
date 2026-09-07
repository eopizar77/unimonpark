import { z } from "zod";

export const salidaSchema = z.object({
    idIngreso: z.number().int().positive("Selecciona un ingreso"),
    lecturaFinalKm: z.number().int().nonnegative("La lectura no puede ser negativa").nullable(),
    tiempoPermanencia: z.number().int().nonnegative("El tiempo no puede ser negativo").nullable(),
    valorTotal: z.number().finite().nonnegative("El valor total no puede ser negativo"),
    observaciones: z.string().max(255).optional(),
    idTarifa: z.number().int().positive("Selecciona una tarifa"),
});

export type SalidaFormValues = z.infer<typeof salidaSchema>;
