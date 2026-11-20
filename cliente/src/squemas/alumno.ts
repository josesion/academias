import { z } from "zod";

/**
 * Esquema de validación Zod para el formulario de alta y modificación de alumno.
 * El email es obligatorio y único como identificador principal.
 * El DNI es opcional (solo para seguro o certificados).
 */
export const CrearAlumnoSchema = z.object({
  /** Email obligatorio: identificador único del alumno y usuario de acceso. */
  email: z.string({ message: "El correo electrónico es requerido" })
    .email({ message: "Ingrese un correo electrónico válido" }),

  /** DNI opcional: solo para seguro o certificados. */
  dni: z.string({ message: "El DNI debe ser una cadena de texto" })
    .optional(),

  nombre: z.string({ message: "EL nombre debe ser una cadena de texto" })
    .min(4, { message: "El nombre debe tener min. 4 letras" })
    .max(60, { message: "El nombre es muy largo" }),

  apellido: z.string({ message: "EL Apellido debe ser una cadena de texto" })
    .min(4, { message: "El Apellido debe tener min. 4 letras" })
    .max(60, { message: "El Apellido es muy largo" }),

  celular: z.string()
    .min(10, { message: "El celular debe tener al menos 10 dígitos" })
    .max(20, { message: "El celular es muy largo" })
    .regex(/^\+\d{7,15}$/, { message: "Ingrese un número válido con código de país (ej: +5491112345678)" })

});

export type AlumnosInputs = z.infer<typeof CrearAlumnoSchema>;