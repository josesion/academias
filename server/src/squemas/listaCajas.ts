import { z } from "zod";

export const EstadoCajaSchema = z.object({
    id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."), 
});

export const HistorialCajaSchema  = z.object({

    
    idUsuarioFiltro: z.number().int().positive().nullable().default(null),
    estadoDiferencia: z.enum(['exacta', 'con_diferencia']).nullable().default(null),

    fechaDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD requerido").optional(),
    fechaHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD requerido").optional(),        
        

        limit: z.coerce.number().int().min(1).default(10), 
        pagina : z.coerce.number().int().min(1).default(10), 
        offset: z.coerce.number().int().min(0).default(0).optional(), 
});




export type EstadoCajaInput = z.infer<typeof EstadoCajaSchema>;
export type HistorialCajaInput = z.infer<typeof HistorialCajaSchema>;

export const SchemaFinal = z.object({
    ...EstadoCajaSchema.shape,
    ...HistorialCajaSchema.shape
});

export type InputConvinados = z.infer<typeof SchemaFinal>;


