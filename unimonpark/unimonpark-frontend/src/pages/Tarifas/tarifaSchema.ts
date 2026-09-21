import { z } from "zod";

export const tarifaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  valorHora: z.number().nullable(),
  activo: z.boolean(),
  idTipoVehiculo: z.number({ message: "El tipo de vehículo es obligatorio" }),
  categoriaPersona: z.enum(["ESTUDIANTE", "DOCENTE_ADMINISTRATIVO_EXTERNO", "CENTRO_OBRERO"]).nullable(),
  tipoCalculo: z.enum(["POR_HORA", "POR_TRAMOS", "PLANA", "MENSUAL"], {
    message: "El tipo de cálculo es obligatorio",
  }),
  horasLimite: z.number().nullable(),
  valorHastaLimite: z.number().nullable(),
  valorDespuesLimite: z.number().nullable(),
  porcentaje: z.number().nullable(),
}).superRefine((valores, ctx) => {
  if (valores.tipoCalculo === "POR_TRAMOS") {
    if (valores.horasLimite == null) {
      ctx.addIssue({ code: "custom", path: ["horasLimite"], message: "Las horas límite son obligatorias" });
    }
    if (valores.valorHastaLimite == null) {
      ctx.addIssue({ code: "custom", path: ["valorHastaLimite"], message: "El valor hasta el límite es obligatorio" });
    }
    if (valores.valorDespuesLimite == null) {
      ctx.addIssue({ code: "custom", path: ["valorDespuesLimite"], message: "El valor después del límite es obligatorio" });
    }
  } else if (valores.tipoCalculo === "MENSUAL") {
    if (valores.porcentaje == null && valores.valorHora == null) {
      ctx.addIssue({ code: "custom", path: ["porcentaje"], message: "Ingresa un porcentaje o un valor fijo mensual" });
    }
  } else {
    if (valores.valorHora == null) {
      ctx.addIssue({ code: "custom", path: ["valorHora"], message: "El valor es obligatorio" });
    }
  }
});

export type TarifaFormValues = z.infer<typeof tarifaSchema>;