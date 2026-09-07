import { z } from "zod";

export const tarifaSchema = z.object({
    idTipoVehiculo: z.number().int().positive("Selecciona un tipo de vehículo"),
    nombre: z.string().trim().min(1, "El nombre es obligatorio").max(255),
    valorHora: z.number().finite().nonnegative("El valor por hora no puede ser negativo"),
    valorDiurno: z.number().finite().nonnegative("El valor diurno no puede ser negativo").nullable(),
    valorNocturno: z.number().finite().nonnegative("El valor nocturno no puede ser negativo").nullable(),
    horaInicioNocturna: z.string().nullable(),
    horaFinNocturna: z.string().nullable(),
    activo: z.boolean(),
});

export type TarifaFormValues = z.infer<typeof tarifaSchema>;
