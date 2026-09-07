import { z } from "zod";

export const facturaSchema = z.object({
    idUsuario: z.number().int().positive("Selecciona un usuario"),
    idSalida: z.number().int().positive("Selecciona una salida"),
    subtotal: z.number().finite().nonnegative("El subtotal no puede ser negativo"),
    descuento: z.number().finite().nonnegative("El descuento no puede ser negativo"),
    iva: z.number().finite().nonnegative("El IVA no puede ser negativo"),
});

export type FacturaFormValues = z.infer<typeof facturaSchema>;
