import { z } from "zod";

// Define el patrón de fecha YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const InscripcionSchema = z.object({
    // --- ID del Plan (INT) ---
    id_plan: z.coerce.number()
        .int("El ID del plan debe ser un número entero.")
        .positive("El ID del plan debe ser positivo (mayor que 0)."),

    // --- ID de la Escuela (INT) ---
    id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),

    // --- DNI del Alumno (BIGINT) ---
    dni_alumno: z.coerce.number()
        .int("El DNI debe ser un número entero sin decimales.")
        .positive("El DNI debe ser un número positivo."),
        // Aporte: Puedes añadir restricciones de longitud si sabes que el DNI 
        // tiene un mínimo y un máximo de dígitos (ej. 8 dígitos).
        // .min(1000000, "El DNI debe tener al menos 7 u 8 dígitos.")    
    // La fecha de inicio debe ser una cadena en formato AAAA-MM-DD y ser una fecha válida.
    fecha_inicio: z.string()
        .regex(DATE_REGEX, "La fecha de inicio debe estar en formato AAAA-MM-DD.")
        .refine((val) => !isNaN(new Date(val).getTime()), "La fecha de inicio no es una fecha válida."),

    fecha_fin: z.string()
        .regex(DATE_REGEX, "La fecha de inicio debe estar en formato AAAA-MM-DD.")
        .refine((val) => !isNaN(new Date(val).getTime()), "La fecha de inicio no es una fecha válida."),
    // Monto
    monto: z.coerce.number() // Eliminado: invalid_type_error
        .positive("El monto debe ser positivo."),
        // El monto puede tener decimales, por eso no usamos .int()

    // Clases asignadas (snapshot del plan)
    clases_asignadas_inscritas: z.coerce.number() // Eliminado: invalid_type_error
        .int("Las clases asignadas deben ser un número entero.")
        .nonnegative("Las clases asignadas no pueden ser negativas."),

    // Meses asignados (snapshot del plan)
    meses_asignados_inscritos: z.coerce.number() // Eliminado: invalid_type_error
        .int("Los meses asignados deben ser un número entero.")
        .nonnegative("Los meses asignados no pueden ser negativas."), 

    estado: z.enum(['activos', 'suspendido', 'vencidos']).optional()      
        
});

export interface VerificacionInputs {
     dni_alumno : number , id_escuela : number , estado : 'activos' | 'vencidos' | 'suspendidos'
};

export type InscripcionInputs = z.infer<typeof InscripcionSchema>;
