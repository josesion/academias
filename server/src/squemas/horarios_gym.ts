import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

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

export const HorarioGymSchema = z.object({
  id_escuela: z.number().int().positive(),
  dni_profesor: z.string().min(1).optional().nullable(),
  id_sala: z.number().int().positive(),
  id_tipo_clase: z.number().int().positive().optional().nullable(),

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
    .optional(),

  estado: EstadoEnum.default("activos"),

  id_usuario: z.number({ message: "id Usuario debe ser numerico" })
    .min(0, { message: "El id debe ser mayor de 0" })
    .positive({ message: 'El id debe ser un número positivo.' }),
});

export const CalendarioHorarioGymSchema = z.object({
  id_escuela: z.number().int().positive(),
  estado: EstadoEnum.default("activos"),
  id_usuario: z.number({ message: "id Usuario debe ser numerico" })
    .min(0, { message: "El id debe ser mayor de 0" })
    .positive({ message: 'El id debe ser un número positivo.' }),
});

export const ModHorarioGymSchema = z.object({
  id: z.number().int().positive(),
  id_escuela: z.number().int().positive(),
  dni_profesor: z.string().min(1).optional().nullable(),
  id_sala: z.number().int().positive(),
  id_tipo_clase: z.number().int().positive().optional().nullable(),
  id_usuario: z.number({ message: "id Usuario debe ser numerico" })
    .min(0, { message: "El id debe ser mayor de 0" })
    .positive({ message: 'El id debe ser un número positivo.' }),
});

export const EliminarHorarioGymSchema = z.object({
  id: z.number().int().positive(),
  id_escuela: z.number().int().positive(),
  estado: EstadoEnum.default("activos"),
  vigente: z.boolean(),
  id_usuario: z.number({ message: "id Usuario debe ser numerico" })
    .min(0, { message: "El id debe ser mayor de 0" })
    .positive({ message: 'El id debe ser un número positivo.' }),
});

export type HorarioGymInput = z.infer<typeof HorarioGymSchema>;
export type HorarioGymCalendarioInput = z.infer<typeof CalendarioHorarioGymSchema>;
export type ModHorarioGymInput = z.infer<typeof ModHorarioGymSchema>;
export type EliminarHorarioGymInput = z.infer<typeof EliminarHorarioGymSchema>;
