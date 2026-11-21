import { z } from "zod";

/** Esquema para crear/modificar un tutor */
export const CrearTutorSchema = z.object({
    dni_tutor: z.string({ message: "El DNI del tutor debe ser una cadena de texto" })
        .nonempty({ message: "El DNI del tutor no debe estar vacío" })
        .min(8, { message: "El DNI del tutor está incompleto" }),

    nombre: z.string({ message: "El nombre debe ser una cadena de texto" })
        .nonempty({ message: "El nombre no debe estar vacío" })
        .min(2, { message: "El nombre debe tener al menos 2 letras" })
        .max(100, { message: "El nombre es muy largo" }),

    apellido: z.string({ message: "El apellido debe ser una cadena de texto" })
        .nonempty({ message: "El apellido no debe estar vacío" })
        .min(2, { message: "El apellido debe tener al menos 2 letras" })
        .max(100, { message: "El apellido es muy largo" }),

    celular: z.union([
        z.string(),
        z.array(z.string())
    ])
    .transform((val) => {
        if (Array.isArray(val)) {
            return val.join('');
        }
        return val;
    })
    .transform((val) => {
        return val.replace(/[^0-9]/g, '');
    })
    .pipe(
        z.string()
            .nonempty({ message: "Celular no debe estar vacío" })
            .min(10, { message: "El celular debe tener al menos 10 dígitos" })
            .max(15, { message: "El celular no puede tener más de 15 dígitos" })
            .regex(/^\d+$/, { message: "El celular debe contener solo números" })
    ),

    email: z.string({ message: "El correo debe ser una cadena de texto" })
        .email({ message: "El formato del correo no es válido" })
        .max(255, { message: "El correo es muy largo" })
        .optional(),

    relacion_con_alumno: z.string({ message: "La relación es requerida" })
        .nonempty({ message: "La relación con el alumno no debe estar vacía" })
        .min(2, { message: "La relación debe tener al menos 2 caracteres" })
        .max(100, { message: "La relación es muy larga" }),

    dni_alumno: z.string({ message: "El DNI del alumno es requerido" })
        .nonempty({ message: "El DNI del alumno no debe estar vacío" }),

    id_escuela: z.number({ message: "id Escuela debe ser numérico" })
        .min(0, { message: "El id debe ser mayor de 0" })
        .positive({ message: 'El id debe ser un número positivo.' }),

    id_usuario: z.number({ message: "id Usuario debe ser numérico" })
        .min(0, { message: "El id debe ser mayor de 0" })
        .positive({ message: 'El id debe ser un número positivo.' })
});

/** Esquema para cambiar el estado de un tutor */
export const EliminarTutorSchema = z.object({
    id_tutor: z.number({ message: "El id del tutor debe ser numérico" })
        .int({ message: 'El id debe ser un número entero.' })
        .positive({ message: 'El id debe ser un número positivo.' }),

    id_escuela: z.number({ message: "id escuela debe ser de tipo numérico" })
        .int({ message: 'El id escuela debe ser un número entero.' })
        .min(0, { message: 'El id escuela debe ser un número mayor a 0.' }),

    estado: z.enum(["activos", "inactivos"]),

    id_usuario: z.number({ message: "id Usuario debe ser numérico" })
        .min(0, { message: "El id debe ser mayor de 0" })
        .positive({ message: 'El id debe ser un número positivo.' })
});

/** Esquema para listar tutores (paginado) */
export const listaTutoresSchema = z.object({
    dni: z.string({ message: "El dni debe ser una cadena de texto" })
        .optional(),

    apellido: z.string({ message: "El apellido debe ser una cadena de texto" })
        .max(60, { message: "El apellido es muy largo" })
        .optional(),

    email: z.string({ message: "El correo debe ser una cadena de texto" })
        .optional(),

    escuela: z.number({ message: "id escuela debe ser de tipo numérico" })
        .int({ message: 'id escuela debe ser un número entero.' })
        .min(0, { message: 'id escuela debe ser un número mayor a 0.' }),

    estado: z.string()
        .min(5, { message: 'El estado debe tener al menos 5 caracteres.' })
        .max(20, { message: 'El estado no puede exceder los 20 caracteres.' }),

    limit: z.number({ message: "Limit debe ser de tipo numérico" })
        .int({ message: 'El límite debe ser un número entero.' })
        .positive({ message: 'El límite debe ser un número positivo.' }),

    offset: z.number({ message: "Offset debe ser de tipo numérico" })
        .int({ message: 'El offset debe ser un número entero.' })
        .min(0, { message: 'El offset debe ser un número mayor a 0.' }),

    pagina: z.number({ message: "Pagina debe ser de tipo numérico" })
        .int({ message: 'La página debe ser un número entero.' })
        .min(1, { message: 'La página debe ser un número mayor a 0.' }),

    id_usuario: z.number({ message: "id Usuario debe ser numérico" })
        .min(0, { message: "El id debe ser mayor de 0" })
        .positive({ message: 'El id debe ser un número positivo.' })
});

/** Esquema para listar tutores sin paginación */
export const listaTutoresSinPaginacionSchema = z.object({
    dni: z.string({ message: "El dni debe ser una cadena de texto" })
        .optional(),

    email: z.string({ message: "El correo debe ser una cadena de texto" })
        .optional(),

    escuela: z.number({ message: "id escuela debe ser de tipo numérico" })
        .int({ message: 'id escuela debe ser un número entero.' })
        .min(0, { message: 'id escuela debe ser un número mayor a 0.' }),

    estado: z.string()
        .min(5, { message: 'El estado debe tener al menos 5 caracteres.' })
        .max(20, { message: 'El estado no puede exceder los 20 caracteres.' }),

    id_usuario: z.number({ message: "id Usuario debe ser numérico" })
        .min(0, { message: "El id debe ser mayor de 0" })
        .positive({ message: 'El id debe ser un número positivo.' })
});

/** Esquema para obtener tutores por DNI de alumno */
export const tutoresPorAlumnoSchema = z.object({
    dni_alumno: z.string({ message: "El DNI del alumno es requerido" })
        .nonempty({ message: "El DNI del alumno no debe estar vacío" }),

    id_escuela: z.number({ message: "id Escuela debe ser numérico" })
        .min(0, { message: "El id debe ser mayor de 0" })
        .positive({ message: 'El id debe ser un número positivo.' })
});

export type TutorInputs = z.infer<typeof CrearTutorSchema>;
export type EliminarTutorInputs = z.infer<typeof EliminarTutorSchema>;
export type ListaTutorInputs = z.infer<typeof listaTutoresSchema>;
export type ListaTutorSinPaginacionInputs = z.infer<typeof listaTutoresSinPaginacionSchema>;
export type TutoresPorAlumnoInputs = z.infer<typeof tutoresPorAlumnoSchema>;
