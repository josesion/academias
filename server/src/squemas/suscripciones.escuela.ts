import { z } from "zod";



export const SuscripcionSchema = z.object({
    id_escuela: z.number().int().positive(),
    id_plan_saas: z.number().int().positive(),
    fecha_inscripcion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato YYYY-MM-DD"),
    fecha_vencimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato YYYY-MM-DD"),
    estado: z.enum(['activo', 'suspendido', 'vencido']).default('activo')
});

export const filtrosSuscripcionesSchema = z.object({
  // Razón social: opcional; si no viene o es '', comodín '%%'
  razon_social: z.string().optional().transform((val) => (val && val !== '' ? `%${val}%` : '%%')),

  // ID del plan SaaS: puede venir como número o string, si no viene, comodín '%%'
  id_plan_saas: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (!val || val === '%%') return '%%';
    return String(val); // Lo pasa a string para que encaje en el LIKE
  }),

  // Fecha de inscripción: opcional; si no viene o es '', comodín '%%'
  fecha_inscripcion: z.string().optional().transform((val) => {
    if (!val || val === '') return '%%';
    return val; // Si envían una fecha como '2026-03-01'
  }),

  // Estado de la suscripción: por defecto 'activo'; manda '' para traer todos ('%%')
  estado: z.string().optional().default('activo').transform((val) => {
    if (!val || val === '') return '%%';
    return val;
  }),

  offset: z.coerce.number({ message: "Offset debe ser un número válido." })
                     .int({ message: "Offset debe ser un entero." })
                     .min(0, { message: "El offset debe ser 0 o positivo." })
                     .default(0),
  limit: z.coerce.number().int().min(1).default(10),
  pagina :     z.number({message : "pagina debe ser numerico"})
                    .int({message : "pagina debe ser entero"})
                    .positive({ message : "pagina debe ser positivo"}),

});

// Tipo de lo que RECIBE el schema (lo que manda el cliente: casi todo opcional)
export type FiltrosSuscripcionesInputs = z.input<typeof filtrosSuscripcionesSchema>;

// Tipo de lo que SALE del parse (defaults y transforms ya aplicados: ninguno es undefined)
export type FiltrosSuscripciones = z.output<typeof filtrosSuscripcionesSchema>;

export type SuscripcionInputs = z.infer<typeof SuscripcionSchema>;
