import {  z } from "zod";

// Define el patrón de fecha YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const EstadoEnum = z.enum(["activos", "inactivos", "vencidos"]);


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

export const VerificarInscripcionSchema  = z.object({
    id_inscripcion : z.coerce.number()
                    .int("El ID de inscripcion debe ser un número entero.")
                    .positive("El ID de inscripcion debe ser positivo (mayor que 0)."),
    dni_alumno: z.coerce.number()
                    .int("El DNI debe ser un número entero sin decimales.")
                    .positive("El DNI debe ser un número positivo."),
    id_escuela: z.coerce.number()
                    .int("El ID de la escuela debe ser un número entero.")
                    .positive("El ID de la escuela debe ser positivo (mayor que 0)."),                
    estado : EstadoEnum
});

export interface VerificacionInputs {
     dni_alumno : number , id_escuela : number , estado : 'activos' | 'vencidos' | 'suspendidos'
};


export const VerificlarPlanSchema = z.object({
        dni_alumno: z.coerce.number()
                    .int("El DNI debe ser un número entero sin decimales.")
                    .positive("El DNI debe ser un número positivo."),

        estado : EstadoEnum,

        id_escuela: z.coerce.number()
                    .int("El ID de la escuela debe ser un número entero.")
                    .positive("El ID de la escuela debe ser positivo (mayor que 0)."),   

});

export interface ResultInscripcionAsistencia{
    id_inscripcion : number,
    vencimiento : string,
    clases_restantes : number
};

export const InscripDetalleSchema  = z.object({
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


    // Clases asignadas (snapshot del plan)
    clases_asignadas_inscritas: z.coerce.number() // Eliminado: invalid_type_error
        .int("Las clases asignadas deben ser un número entero.")
        .nonnegative("Las clases asignadas no pueden ser negativas."),

    // Meses asignados (snapshot del plan)
    meses_asignados_inscritos: z.coerce.number() // Eliminado: invalid_type_error
        .int("Los meses asignados deben ser un número entero.")
        .nonnegative("Los meses asignados no pueden ser negativas."), 

    estado: z.enum(['activos', 'suspendido', 'vencidos']).optional(),     
    
    //------  para el detalle
     id_caja: z.number({ message: "ID de caja requerido" }).positive("ID de caja no válido"),
  
  id_categoria: z.number({ message: "Categoría requerida" }).positive("ID de categoría no válido"),
  
  monto: z.number({ message: "El monto debe ser un número" })
    .min(0.01, "El monto debe ser mayor a cero"),
  
  metodo_pago: z.enum(['efectivo', 'transferencia', 'credito', 'debito'], {
    message: "Seleccione un método de pago válido" 
  }),
  
  descripcion: z.string().optional().default("sin nota"),
  
  referencia_id: z.number().optional().default(0),
        
});

export const FiltroHistorialSchema = z.object({
  id_escuela: z.coerce.number().int().positive("ID de escuela inválido"),
  
  // Validamos que sean strings de fecha válidos (YYYY-MM-DD)
  fecha_desde: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha de inicio inválida",
  }),
  
  fecha_hasta: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha de fin inválida",
  }),
  
  // Opcional: para filtrar por estado desde el input
  estado: z.enum(['activos', 'vencidos', 'todos']).optional().default('todos'),

        pagina : z.number({message:"Limit debe ser de tipo numerico"})
                .int({ message: 'El limite debe ser un número entero.' })
                .positive({ message: 'El limite debe ser un número positivo.' }),

        limit : z.number({message:"Limit debe ser de tipo numerico"})
                .int({ message: 'El limite debe ser un número entero.' })
                .positive({ message: 'El limite debe ser un número positivo.' }),

        offset :z.number({message:"Limit debe ser de tipo numerico"})
                .int({ message: 'El offset debe ser un número entero.' })
                .min(0, { message: 'El offset debe ser un número  mayor a 0.' })  
});


export type InscripcionInputs = z.infer<typeof InscripcionSchema>;
export type InscripcionesDetallesInputs = z.infer<typeof InscripDetalleSchema>; 
export type VerificarInscripcionInput = z.infer<typeof VerificarInscripcionSchema>;
export type VerificarPlanAsistenciaUnputs  = z.infer<typeof VerificlarPlanSchema >;
export type FiltroHistorialInputs = z.infer<typeof FiltroHistorialSchema>;
