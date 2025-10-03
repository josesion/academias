import { z } from "zod";

export const CrearAlumnoSchema = z.object({
dni :       z.string({message : "El dni es requerido"})
                .nonempty({message : "Dni no debe estar vacio"})
                .min(8,{message : "EL dni esta incompleto"}),

nombre :    z.string({message: "EL nombre debe ser una cadena de texto"})
                .nonempty({message : "Nombre no debe estar vacio"})
                .min(4,{message: "El nombre debe tener min. 4 letras"})
                .max(60 ,{message: "El nombre es muy largo"}) ,

apellido :   z.string({message: "EL Apellido debe ser una cadena de texto"})
                .nonempty({message : "Apellido no debe estar vacio"})
                .min(4,{message: "El Apellido debe tener min. 4 letras"})
                .max(60 ,{message: "El Apellido es muy largo"}) ,

celular :   z.string()
                .nonempty({message : "Celular no debe estar vacio"})
                .min(10, { message: "El celular debe tener al menos 10 dígitos" })
                .max(15, { message: "El celular no puede tener más de 15 dígitos" })
                .regex(/^\d+$/, { message: "El celular debe contener solo números" }),

id_escuela :    z.number({message : "id Escuela debe ser numerico"}) 
                        .min(0 , {message : "El id debe ser mayor de 0"})
                        .positive({ message: 'El limite debe ser un número positivo.' })
                
});

export const CrearAlumnoEscuelaSchema = z.object({
        dni :       z.string({message : "El dni es requerido"}),

        id_escuela :    z.number({message : "id Escuela debe ser numerico"}) 
                        .min(0 , {message : "El id debe ser mayor de 0"})
                        .positive({ message: 'El limite debe ser un número positivo.' }),

});             
export const listaAlumnosSchema = z.object({
dni :       z.string({message : "El dni es requerido"}),

apellido :   z.string({message: "EL Apellido debe ser una cadena de texto"})
                .max(60 ,{message: "El Apellido es muy largo"}) ,

escuela : z.number({message:"Limit debe ser de tipo numerico"})
                .int({ message: 'El offset debe ser un número entero.' })
                .min(0, { message: 'El offset debe ser un número  mayor a 0.' }),                

        estado: z.string()
                .min(5, { message: 'El estado debe tener al menos 5 caracteres.' })
                .max(20, { message: 'El estado no puede exceder los 20 caracteres.' }),

        limit : z.number({message:"Limit debe ser de tipo numerico"})
                .int({ message: 'El limite debe ser un número entero.' })
                .positive({ message: 'El limite debe ser un número positivo.' }),

        offset :z.number({message:"Limit debe ser de tipo numerico"})
                .int({ message: 'El offset debe ser un número entero.' })
                .min(0, { message: 'El offset debe ser un número  mayor a 0.' })


});

export type AlumnosInputs = z.infer<typeof CrearAlumnoSchema>;
export type AlumnoEscuelaInputs = z.infer<typeof CrearAlumnoEscuelaSchema>;
export type ListaAlumnoInputs = z.infer<typeof listaAlumnosSchema>; 