import { z } from "zod";


export const GuardarFlayerSchema = z.object({
    id_escuela: z
        .number({
            error: "El ID de la escuela debe ser un número",
        })
        .int({
            error: "El ID de la escuela debe ser un número entero",
        })
        .positive({
            error: "El ID de la escuela debe ser mayor a cero",
        }),
    plan: z
        .number({
            error: "El ID de Plan debe ser un número",
        })
        .int({
            error: "El ID de Plan debe ser un número entero",
        })
        .positive({
            error: "El ID de Plan debe ser mayor a cero",
        }),        

    titulo: z
        .string({
            error: "El título debe ser un texto",
        })
        .min(1, {
            error: "El título es obligatorio",
        })
        .max(150, {
            error: "El título no puede superar los 150 caracteres",
        }),

    descripcion: z
        .string({
            error: "La descripción debe ser un texto",
        })
        .max(500, {
            error: "La descripción no puede superar los 500 caracteres",
        }),

    imagen_url: z
        .string({
            error: "La URL de la imagen debe ser un texto",
        })

        .max(500, {
            error: "La URL de la imagen no puede superar los 500 caracteres",
        }),

    public_id: z
        .string({
            error: "El ID público de la imagen debe ser un texto",
        })
        .min(1, {
            error: "El ID público de la imagen es obligatorio",
        })
        .max(255, {
            error: "El ID público de la imagen no puede superar los 255 caracteres",
        }),

    fecha_actualizacion: z
        .date({
            error: "La fecha de actualización debe ser una fecha válida",
        })
        .nullable(),
});


export const GuardarImagenSchema = z.object({
    buffer: z.instanceof(Buffer, {
        error: "La imagen debe ser un buffer válido",
    }),

    tipo: z
        .string({
            error: "El tipo de imagen debe ser un texto",
        })
        .min(1, {
            error: "El tipo de imagen es obligatorio",
        }),

    size: z
        .number({
            error: "El tamaño de la imagen debe ser un número",
        })
        .positive({
            error: "El tamaño de la imagen debe ser mayor a cero",
        }),

    nombre: z
        .string({
            error: "El nombre de la imagen debe ser un texto",
        })
        .min(1, {
            error: "El nombre de la imagen es obligatorio",
        }),
});

export type GuardarFlayerInputs = z.infer<typeof GuardarFlayerSchema>;
export type ImagenFlayerInputs = z.infer<typeof GuardarImagenSchema>;
