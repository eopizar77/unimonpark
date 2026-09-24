import { z } from "zod";

export const facturaSchema = z.object({
    tipoPropietario: z.enum(["USUARIO", "EXTERNO"]).default("USUARIO"),
    idUsuario: z.number().nullable().optional(),
    idExterno: z.number().nullable().optional(),
    idSalida: z.number().int().positive("Selecciona una salida"),
    descuento: z.number().finite().nonnegative("El descuento no puede ser negativo"),
    iva: z.number().finite().nonnegative("El IVA no puede ser negativo"),
}).superRefine((valores, ctx) => {
    if (valores.tipoPropietario === "USUARIO") {
        if (!valores.idUsuario || valores.idUsuario <= 0) {
            ctx.addIssue({
                code: "custom",
                path: ["idUsuario"],
                message: "Debes seleccionar un usuario",
            });
        }
    } else if (valores.tipoPropietario === "EXTERNO") {
        if (!valores.idExterno || valores.idExterno <= 0) {
            ctx.addIssue({
                code: "custom",
                path: ["idExterno"],
                message: "Debes seleccionar un visitante externo",
            });
        }
    }
});

export type FacturaFormValues = z.infer<typeof facturaSchema>;
