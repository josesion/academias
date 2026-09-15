import { z } from "zod";



export const SuscripcionSchema = z.object({
    id_escuela: z.number().int().positive(),
    id_plan_saas: z.number().int().positive(),
    fecha_inscripcion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato YYYY-MM-DD"),
    fecha_vencimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato YYYY-MM-DD"),
    estado: z.enum(['activo', 'suspendido', 'vencido']).default('activo')
});



export type SuscripcionInputs = z.infer<typeof SuscripcionSchema>;
