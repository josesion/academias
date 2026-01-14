
import { z } from "zod";

/**
 * Validaciones auxiliares
 */
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/; // HH:MM or HH:MM:SS
const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

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

/**
 * Schema principal para horarios_clases
 */
export const HorarioClaseSchema = z
  .object({
    //id: z.number().int().positive().optional(), // auto_increment en DB (opcional en input)
    id_escuela: z.number().int().positive(),
    dni_profesor: z.string().min(1),

    id_nivel: z.number().int().positive(),
    id_tipo_clase: z.number().int().positive(),

    dia_semana: DiaSemanaEnum,
    hora_inicio: z
      .string()
      .regex(timeRegex, "hora_inicio debe tener formato HH:MM o HH:MM:SS"),
    hora_fin: z
      .string()
      .regex(timeRegex, "hora_fin debe tener formato HH:MM o HH:MM:SS"),

    fecha_creacion: z
      .string()
      .regex(dateRegex, "fecha_creacion debe tener formato YYYY-MM-DD")
      .optional(), // puede ser generada por el servidor si no viene

    estado: EstadoEnum.default("activos"),
  })

export const CalendarioHorarioSchema = z.object({
  id_escuela: z.number().int().positive(),
  estado: EstadoEnum.default("activos"),
}); 

export const modHorariosSchema = z.object({
   dni_profesor: z.string().min(1),
   id_tipo_clase: z.number().int().positive(),
   id_nivel: z.number().int().positive(),
   id : z.number().int().positive(),
   id_escuela: z.number().int().positive(),
});

export const EliminarHorarioSchema = z.object({
     estado: EstadoEnum.default("activos"),
     vigente : z.boolean(),
     id : z.number().int().positive(),
     id_escuela: z.number().int().positive(),
});


export const DataHorarioAsistenciaSchema = z.object({
    id_escuela: z.number().int().positive(),  
    estado : EstadoEnum,
    dia : DiaSemanaEnum
});

export const DataAlumnoVigenteSchema = z.object({
    id_escuela: z.number().int().positive(),  
    estado : EstadoEnum,
    dia : DiaSemanaEnum,
    dni_alumno: z.coerce.number()
        .int("El DNI debe ser un número entero sin decimales.")
        .positive("El DNI debe ser un número positivo."), 
});


export type HorarioClaseInput = z.infer<typeof HorarioClaseSchema>;
export type HorarioCalendarioInput = z.infer<typeof CalendarioHorarioSchema>;
export type ModHorarioInput = z.infer<typeof modHorariosSchema>;
export type EliminarHorarioInput = z.infer<typeof EliminarHorarioSchema>;
export type DataHorarioAsistenciaInputs =  z.infer<typeof DataHorarioAsistenciaSchema>;
export type DataAlumnoVigenteInputs =  z.infer<typeof DataAlumnoVigenteSchema>;
