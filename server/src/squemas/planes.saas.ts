import { z } from "zod";



export const PlanSaasSchema = z.object({
  id_plan: z.number().int().positive().optional(),
  tipo: z.enum(['basico', 'intermedio', 'premium']).default('basico'),
  descripcion: z.string().min(3, "La descripción debe tener al menos 3 caracteres").max(100),
  precio: z.number().positive("El precio debe ser mayor a 0"),
  cant_flyers: z.number().int().nonnegative("La cantidad de flyers no puede ser negativa").default(0),
  estado: z.enum(['activo', "inactivo"]).default('activo')
});

export const PlanDeleteSaasSchema = z.object({
  id_plan: z.number().int().positive(),
});


export type PlanSaasInputs = z.infer<typeof PlanSaasSchema>;
export type PlanDeletSaasInputs = z.infer<typeof PlanDeleteSaasSchema>;