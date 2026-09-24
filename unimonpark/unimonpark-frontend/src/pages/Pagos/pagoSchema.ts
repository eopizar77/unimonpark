import { z } from "zod";

export const pagoSchema = z.object({
    idFactura: z.number().int().positive("Selecciona una factura"),
    monto: z.number().finite().min(0, "El valor no puede ser negativo"),
    metodoPago: z.string().trim().min(1, "Selecciona un mÃ©todo de pago").max(255),
    referencia: z.string().max(255).optional(),
});

export type PagoFormValues = z.infer<typeof pagoSchema>;

