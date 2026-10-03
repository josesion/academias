import { z } from "zod";


const EscuelaBaseSchema = z.object({
    dni_propietario: z.coerce.number().int().positive("El DNI debe ser un número válido"),
    nombre_propietario: z.string().min(1, "El nombre del propietario es requerido").max(100),
    apellido_propietario: z.string().min(1, "El apellido del propietario es requerido").max(100),
    razon_social: z.string().min(1, "La razón social es requerida").max(100),
    direccion: z.string().min(1, "La dirección es requerida").max(100),
    celular: z.string().min(1, "El celular es requerido").max(20),
    urlImagen: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
    fecha_registro: z.string().optional(),
    baja: z.string().default("activos"),
    public_id: z
        .string({
            error: "El ID público de la imagen debe ser un texto",
        })
        .min(1, {
            error: "El ID público de la imagen es obligatorio",
        })
        .max(255, {
            error: "El ID público de la imagen no puede superar los 255 caracteres",
        }).optional(),

});

export const PostEscuelaScjema = EscuelaBaseSchema;

export const ModEscuelaSchema = EscuelaBaseSchema.extend({
    id_escuela: z.coerce.number().int().positive("El id de la escuela es requerido"),
});

export const EstadoEscuelaSchema = z.object({
   estado: z.string().default("activos"), 
   id_escuela: z.coerce.number().int().positive("El id de la escuela es requerido"),    
});


export const FiltroListadoEscualSchema = z.object({
   
    apellido: z.string().optional().default(""),
    dni: z.string().optional().default(""),
    razon_social: z.string().optional().default(""),
  // Opcional: para filtrar por estado desde el input
       estado: z.enum(['activos', 'vencidos', 'todos', "suspendido", "inactivos"]).optional().default('todos'),

        pagina : z.number({message:"Limit debe ser de tipo numerico"})
                .int({ message: 'El limite debe ser un número entero.' })
                .positive({ message: 'El limite debe ser un número positivo.' }),

        limit : z.number({message:"Limit debe ser de tipo numerico"})
                .int({ message: 'El limite debe ser un número entero.' })
                .positive({ message: 'El limite debe ser un número positivo.' }),

        offset :z.number({message:"Limit debe ser de tipo numerico"})
                .int({ message: 'El offset debe ser un número entero.' })
                .min(0, { message: 'El offset debe ser un número  mayor a 0.' })
                .optional() 
});

export type PostEscuelasInputs = z.infer<typeof PostEscuelaScjema>;
export type ModEscuelasInputs = z.infer<typeof ModEscuelaSchema>;
export type EstadoEscuelasInputs = z.infer<typeof EstadoEscuelaSchema>;
export type ListadoEscuelasInputs = z.infer<typeof FiltroListadoEscualSchema>;