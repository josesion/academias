import { z } from "zod";

export const CrearSalaSchema = z.object({
    nombre : z.string({ message: "Nombre debe ser texto" })
            .trim()
            .min(2, { message: "El nombre debe tener al menos 2 caracteres." }) 
            .max(100, { message: "El nombre debe tener como máximo 100 caracteres." }),

    capacidad : z.number({ message: "Capacidad debe ser numérico" })
                .int({ message: "Capacidad debe ser entero" })
                .positive({ message: "Capacidad debe ser positiva" })
                .optional()
                .nullable(),

    fecha_creacion :z.string({ message: "La fecha de creación es requerida" })
           .trim()
           .min(10 , { message : "Verificar Formato de fecha (YYYY-MM-DD)" }),

    id_escuela : z.number({message : "Ident. Escuela debe ser numerico"})
                 .int({message : "Ident. Escuela debe ser entero"})
                 .positive({ message : "Ident. Escuela debe ser positivo"}),  
                 
    id_usuario :    z.number({message : "id Usuario debe ser numerico"}) 
                    .min(0 , {message : "El id debe ser mayor de 0"})
                    .positive({ message: 'El id debe ser un número positivo.' })                   

});

export const ModificarSalaSchema = z.object({

    id : z.number({ message: "Identificador de sala debe ser numérico." })
            .int({ message: "Identificador de sala debe ser un entero." })
            .positive({ message: "Identificador de sala debe ser positivo." }),    

    nombre : z.string({ message: "Nombre debe ser texto" })
            .trim()
            .min(2, { message: "El nombre debe tener al menos 2 caracteres." }) 
            .max(100, { message: "El nombre debe tener como máximo 100 caracteres." }),

    capacidad : z.number({ message: "Capacidad debe ser numérico" })
                .int({ message: "Capacidad debe ser entero" })
                .positive({ message: "Capacidad debe ser positiva" })
                .optional()
                .nullable(),

    id_escuela : z.number({message : "Ident. Escuela debe ser numerico"})
                 .int({message : "Ident. Escuela debe ser entero"})
                 .positive({ message : "Ident. Escuela debe ser positivo"}),
                 
    id_usuario :    z.number({message : "id Usuario debe ser numerico"}) 
                    .min(0 , {message : "El id debe ser mayor de 0"})
                    .positive({ message: 'El id debe ser un número positivo.' })      


});


const EstadosPermitidos = z.enum(['activos', 'inactivos'],
                         {message : "Estado debe ser activos o inactivos"} );

export const EstadoSalaSchema = z.object({

    id : z.number({ message: "Identificador de sala debe ser numérico." })
            .int({ message: "Identificador de sala debe ser un entero." })
            .positive({ message: "Identificador de sala debe ser positivo." }),

    estado:        EstadosPermitidos
                .default('activos'),                

    id_escuela : z.number({message : "Ident. Escuela debe ser numerico"})
                 .int({message : "Ident. Escuela debe ser entero"})
                 .positive({ message : "Ident. Escuela debe ser positivo"}),
                 
    id_usuario :    z.number({message : "id Usuario debe ser numerico"}) 
                    .min(0 , {message : "El id debe ser mayor de 0"})
                    .positive({ message: 'El id debe ser un número positivo.' })                     

});

const EstadoPlanEnum = z.enum(['activos', 'inactivos', 'todos']).default('activos');

export const ListaSalasUsuariosSchema = z.object({
        nombre   : z.string().optional().default(''), 

        estado        : EstadoPlanEnum,
        
        pagina  :    z.number({message : "pagina debe ser numerico"})
                    .int({message : "pagina debe ser entero"})
                    .positive({ message : "pagina debe ser positivo"}),        

        id_escuela  :    z.number({message : "Ident. Escuela debe ser numerico"})
                    .int({message : "Ident. Escuela debe ser entero"})
                    .positive({ message : "Ident. Escuela debe ser positivo"}),

        limite: z.coerce.number({ message: "Límite debe ser un número válido." })
                    .int({ message: "Límite debe ser un entero." })
                    .min(1, { message: "El límite debe ser al menos 1." }),

        offset: z.coerce.number({ message: "Offset debe ser un número válido." })
                     .int({ message: "Offset debe ser un entero." })
                     .min(0, { message: "El offset debe ser 0 o positivo." }),    
});

export const ListaSalasUsuarioSinPagSchema = z.object({
        nombre   : z.string().optional().default(''), 

        estado        : EstadoPlanEnum,  

        id_escuela  :    z.number({message : "Ident. Escuela debe ser numerico"})
                    .int({message : "Ident. Escuela debe ser entero"})
                    .positive({ message : "Ident. Escuela debe ser positivo"}),

});

export type CrearSalaInput = z.infer<typeof CrearSalaSchema>;
export type ModificarSalaInput = z.infer<typeof ModificarSalaSchema>;
export type EstadoSalaInput   = z.infer<typeof EstadoSalaSchema>;
export type ListadoSalaInput  =  z.infer<typeof ListaSalasUsuariosSchema>;
export type ListadoSalaSinPagInput  =  z.infer<typeof ListaSalasUsuarioSinPagSchema>;
