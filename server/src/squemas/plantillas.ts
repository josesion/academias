import { z } from "zod";

export const PlantillaAltaSchema = z.object({
    id_escuela: z.coerce.number().int().positive(),
    nombre: z.string().min(1),
    alumnos: z.array(z.coerce.number().int().positive()).min(1),
});

export const PlantillaBajaSchema = z.object({
    id_escuela: z.coerce.number().int().positive(),
    id_plantilla: z.coerce.number().int().positive(),
});

export const PlantillaListadoSchema = z.object({
    id_escuela: z.coerce.number().int().positive(),
});

/** Agrega uno o varios alumnos a una plantilla existente. */
export const PlantillaAlumnosAgregarSchema = z.object({
    id_escuela: z.coerce.number().int().positive(),
    id_plantilla: z.coerce.number().int().positive(),
    alumnos: z.array(z.coerce.number().int().positive()).min(1),
});

/** Quita un alumno de una plantilla. */
export const PlantillaAlumnoQuitarSchema = z.object({
    id_escuela: z.coerce.number().int().positive(),
    id_plantilla: z.coerce.number().int().positive(),
    dni_alumno: z.coerce.number().int().positive(),
});

export type PlantillaAltaInputs = z.infer<typeof PlantillaAltaSchema>;
export type PlantillaBajaInputs = z.infer<typeof PlantillaBajaSchema>;
export type PlantillaListadoInputs = z.infer<typeof PlantillaListadoSchema>;
export type PlantillaAlumnosAgregarInputs = z.infer<typeof PlantillaAlumnosAgregarSchema>;
export type PlantillaAlumnoQuitarInputs = z.infer<typeof PlantillaAlumnoQuitarSchema>;
