import { z } from "zod";

export const crearPlanesSchema = z.object({
        descripcion : z.string({ message: "Debe ser una cadena de texto." })
                .min(6, { message: 'la descripcion  debe tener al menos 6 caracteres.' })
                .max(50, { message: 'la descripcion no puede exceder los 50 caracteres.' }),

        limites_cedes : z.number({ message: 'Debe ser un valor númerico.' })
                        .min(1, { message: 'El limite de cedes debe ser al menos 1.' })
                        .max(10, { message: 'El limite de cedes no puede exceder los 10.' }),  

        precio_mensual  :   z.number({ message: 'Debe ser un valor númerico.' })
                .min(1, { message: 'El precio debe ser al menos 1$.' })
                .max(1000000, { message: 'El precio no puede exceder los 100000$.' }) 
                .default(1000),  

        estado : z.string()
                .min(5, { message: 'El estado debe tener al menos 5 caracteres.' })
                .max(20, { message: 'El estado no puede exceder los 20 caracteres.' }) 
            .default('activo') // Por defecto el estado es activo           
});

export const modPlanesSchema = z.object({
    // El 'id' es obligatorio para saber qué plan actualizar.
        id: z.number({ message: 'El ID debe ser un valor numérico.' })
                .int({ message: 'El ID debe ser un número entero.' })
                .positive({ message: 'El ID debe ser un número positivo.' }),

    // Los campos de actualización son opcionales
        descripcion: z.string({ message: "Debe ser una cadena de texto." })
                .min(6, { message: 'la descripcion debe tener al menos 6 caracteres.' })
                .max(50, { message: 'la descripcion no puede exceder los 50 caracteres.' }),
        

        limites_cedes: z.number({ message: 'Debe ser un valor númerico.' })
                .min(1, { message: 'El limite de cedes debe ser al menos 1.' })
                .max(10, { message: 'El limite de cedes no puede exceder los 10.' }),


        precio_mensual: z.number({ message: 'Debe ser un valor númerico.' })
                .min(1, { message: 'El precio debe ser al menos 1$.' })
                .max(1000000, { message: 'El precio no puede exceder los 100000$.' }),


        estado: z.string()
                .min(5, { message: 'El estado debe tener al menos 5 caracteres.' })
                .max(20, { message: 'El estado no puede exceder los 20 caracteres.' })

});

export const listaPlanesSchema = z.object({
        estado :z.string({message :"El estado debe ser un valor de texto"})
                .min(6,{message :"El estado debe tener al menos  6 caracteres"})
                .max(20,{message :"El estado debe tener menos de 20 caracteres"}),

        orden : z.enum(['descripcion', 'precio_mensual'], {
                message: "El orden solo puede ser 'descripcion' o 'precio_mensual'."
        }),

        descripcion :   z.string({ message : "La descripcion debe ser una cadena de texto"})
                        .min(1,{ message : "La descripcion no debe ser una cadena vacia" }),

        limit : z.number({message:"Limit debe ser de tipo numerico"})
                .int({ message: 'El limite debe ser un número entero.' })
                .positive({ message: 'El limite debe ser un número positivo.' }),

        offset :z.number({message:"Limit debe ser de tipo numerico"})
                .int({ message: 'El offset debe ser un número entero.' })
                .min(0, { message: 'El offset debe ser un número  mayor a 0.' })
});


export type CrearInputsPlanes = z.infer<typeof crearPlanesSchema>;
export type ModInputsPlanes   = z.infer<typeof modPlanesSchema>;
export type ListaInputsPlanes = z.infer<typeof listaPlanesSchema>;