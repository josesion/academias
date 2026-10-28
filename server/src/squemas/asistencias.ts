import { z } from "zod";

/**
 * Validaciones auxiliares
 */

export const DiaSemanaEnum = z.enum([
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
]);
export const EstadoEnum = z.enum(["activos", "inactivos", "suspendido"]);
//const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const AsistenciaSchema = z.object({
// aca solo tendremos algunos datos ya q los demas estaran en incri de verificacion


    id_horario_clase :  z.coerce.number()
            .int("El ID del id_horario_clase debe ser un número entero.")
            .positive("El ID del id_horario_clase debe ser positivo (mayor que 0)."),      
});

export const ClaseActualSchema = z.object({
    id_escuela: z.number().int().positive(),    
    estado : EstadoEnum,
    dia : DiaSemanaEnum 
});

export const ClaseProximaSchema = z.object({
    id_escuela: z.number().int().positive(),    
    estado : EstadoEnum, 
    dia : DiaSemanaEnum
});



/**
 * Alta de asistencia **manual** (spec 043).
 *
 * A diferencia del kiosko (`/api/asistencia`), la asistencia manual:
 * - **no** exige estar dentro de la ventana horaria (15 min antes / 30 min
 *   después del inicio de la clase), y
 * - sólo admite la **clase que está en curso** o **la que sigue**.
 */
export const AsistenciaManualSchema = z.object({
    id_escuela: z.coerce.number().int().positive(),
    id_horario_clase: z.coerce.number().int().positive(),
    id_inscripcion: z.coerce.number().int().positive(),
    dni_alumno: z.coerce.number().int().positive(),
    estado: EstadoEnum,
});

export type AsistenciaManualInputs = z.infer<typeof AsistenciaManualSchema>;

/**
 * Verificación del horario para la asistencia **manual** (spec 043).
 * El horario tiene que ser la clase en curso o la próxima.
 */
export const HorarioManualSchema = z.object({
    id_escuela: z.coerce.number().int().positive(),
    id_horario_clase: z.coerce.number().int().positive(),
    estado: EstadoEnum,
    dia: DiaSemanaEnum,
});

export type HorarioManualInputs = z.infer<typeof HorarioManualSchema>;

export type AsistenciaInputs = z.infer<typeof AsistenciaSchema>;
export type ClasesActualInputs = z.infer<typeof ClaseActualSchema>;
export type ClasesProximaInputs = z.infer<typeof ClaseProximaSchema>;

export const InfoAlumnoSchema = z.object({
    id_escuela: z.coerce.number().int().positive(),
    dni_alumno: z.coerce.number().int().positive(),
});

export type InfoAlumnoInputs = z.infer<typeof InfoAlumnoSchema>;

export const BuscarAlumnoSchema = z.object({
    id_escuela: z.coerce.number().int().positive(),
    termino: z.string().trim().min(1).max(50),
});

export type BuscarAlumnoInputs = z.infer<typeof BuscarAlumnoSchema>;

/**
 * Filtros del listado de asistencias (spec 048).
 *
 * - `desde` / `hasta` son **obligatorios**: el rango acota siempre la consulta
 *   por `idx_asistencia_escuela_fecha`. Si faltan, el handler global responde
 *   400 `VALIDATION_ERROR` (no hay default en el servidor).
 * - El resto de los filtros son opcionales y llegan como `null` cuando el
 *   cliente no los manda.
 * - `pagina` / `limit` tienen default; el `offset` **no** viaja por la URL: lo
 *   calcula el servicio a partir de `pagina`.
 */
export const ListadoAsistenciasSchema = z.object({
    id_escuela: z.coerce.number().int().positive(),

    desde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD requerido"),
    hasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD requerido"),

    dia_semana:     DiaSemanaEnum.nullable().default(null),
    hora:           z.string()
                      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato HH:MM requerido")
                      .nullable().default(null),
    dni_profesor:   z.string().trim().min(1).max(20).nullable().default(null),
    id_nivel:       z.coerce.number().int().positive().nullable().default(null),
    id_tipo_clase:  z.coerce.number().int().positive().nullable().default(null),

    pagina: z.coerce.number().int().min(1).default(1),
    limit:  z.coerce.number().int().min(1).max(100).default(15),
}).refine((d) => d.desde <= d.hasta, {
    message: "La fecha 'desde' no puede ser posterior a 'hasta'.",
    path: ["desde"],
});

export type ListadoAsistenciasInputs = z.infer<typeof ListadoAsistenciasSchema>;
