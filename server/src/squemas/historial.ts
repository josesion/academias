import { z } from "zod";

export const historialSchema = z.object({
    id_escuela: z
        .number({
            message: "El ID de escuela debe ser un número"
        })
        .int("El ID de escuela debe ser entero")
        .positive("El ID de escuela debe ser positivo"),

    id_usuario: z
        .number({
            message: "El ID de usuario debe ser un número"
        })
        .int("El ID de usuario debe ser entero")
        .positive("El ID de usuario debe ser positivo"),

    modulo: z.enum([
        "ALUMNOS",
        "PROFESORES",
        "PLANES",
        "INSCRIPCIONES",
        "CAJA",
        "HORARIOS",
        "USUARIOS",
        "GENEROS_MUSICALES",
        "NIVELES_BAILE",
        "TIPOS_BAILE",
        "CATEGORIAS_CAJA",
        "METODOS_PAGO",
        "ASISTENCIAS"
    ], {
        message: "El módulo enviado no es válido"
    }),

    accion: z.enum([
        "CREAR",
        "MODIFICAR",
        "ELIMINAR",
        "RESTAURAR",
        "ABRIR",
        "CERRAR",
        "INGRESO",
        "EGRESO",
        "LOGIN",
        "LOGOUT"
    ], {
        message: "La acción enviada no es válida"
    }),

    id_registro: z
        .number({
            message: "El ID del registro debe ser un número"
        })
        .int("El ID del registro debe ser entero")
        .positive("El ID del registro debe ser positivo")
        .nullable()
        .optional(),

    descripcion: z
        .string({
            message: "La descripción debe ser un texto"
        })
        .trim()
        .min(1, "La descripción es obligatoria")
        .max(300, "La descripción no puede superar los 300 caracteres"),

    datos: z
        .record(z.string(), z.unknown())
        .nullable()
        .optional()
});


export const GetHistorialSchema = z.object({
    id_escuela: z
        .number({
            message: "El ID de escuela debe ser un número"
        })
        .int("El ID de escuela debe ser entero")
        .positive("El ID de escuela debe ser positivo"),
});

export type HistorialInputs = z.infer<typeof historialSchema>;
export type GetHistorialInputs = z.infer<typeof GetHistorialSchema>;