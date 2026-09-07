import { z } from "zod";

export const pagoSchema = z.object({
    idFactura: z.number().int().positive("Selecciona una factura"),
    monto: z.number().finite().positive("El monto debe ser mayor que cero"),
    metodoPago: z.string().trim().min(1, "Selecciona un método de pago").max(255),
    referencia: z.string().max(255).optional(),
});

export type PagoFormValues = z.infer<typeof pagoSchema>;
