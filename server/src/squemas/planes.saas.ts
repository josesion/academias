import { z } from "zod";



export const PlanSaasSchema = z.object({
  id_plan: z.number().int().positive().optional(),
  tipo: z.enum(['basico', 'intermedio', 'premium']).default('basico'),
  descripcion: z.string().min(3, "La descripción debe tener al menos 3 caracteres").max(100),
  precio: z.number().positive("El precio debe ser mayor a 0"),
  cant_flyers: z.number().int().nonnegative("La cantidad de flyers no puede ser negativa").default(0),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
  
  // Lo hacemos opcional por si la petición no lo envía

  
  caracteristicas: z.array(
    z.object({
      clave: z.string().min(1, "La clave es requerida"),
      valor: z.union([z.string(), z.number()]).refine(val => val !== undefined && val !== "", {
        message: "El valor es requerido"
      })
    })
  ).optional()
 
});

export const PlanDeleteSaasSchema = z.object({
  id_plan: z.number().int().positive(),
});

export const PlanEstadoSaasSchema = z.object({
  id_plan: z.number().int().positive(),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
});

export const FiltroPlanesSchema = z.object({
  estado: z.enum(['activo', 'inactivo']).default('activo'), 
});

export type PlanSaasInputs = z.infer<typeof PlanSaasSchema>;
export type PlanDeletSaasInputs = z.infer<typeof PlanDeleteSaasSchema>;
export type PlanEstadoSaasInputs = z.infer<typeof PlanEstadoSaasSchema>;
export type FiltroPlanesInputs = z.infer<typeof FiltroPlanesSchema>;