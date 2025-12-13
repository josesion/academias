
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




export type HorarioClaseInput = z.infer<typeof HorarioClaseSchema>;

