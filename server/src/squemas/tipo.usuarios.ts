import { z } from "zod";

export const CrearTipoSchema = z.object({
    tipo : z.string({ message: "Tipo debe ser texto" })
            .trim()
            .min(6, { message: "El Tipo es requerido." }) 
            .max( 20 , { message: "El nivel debe tener al menos 15 caracteres." }),

    fecha_creacion :z.string({ message: "La fecha de creación es requerida" })
           .trim()
           .min(10 , { message : "Verificar Formato de fecha (YYYY-MM-DD)" }),

  
    id_escuela : z.number({message : "Ident. Escuela debe ser numerico"})
                 .int({message : "Ident. Escuela debe ser entero"})
                 .positive({ message : "Ident. Escuela debe ser positivo"}),                
});

export const ModTipoSchema = z.object({
    tipo : z.string({ message: "Tipo debe ser texto" })
            .trim()
            .min(6, { message: "El Tipo es requerido." }) 
            .max( 20 , { message: "El nivel debe tener al menos 15 caracteres." }),

  
    id_escuela : z.number({message : "Ident. Escuela debe ser numerico"})
                 .int({message : "Ident. Escuela debe ser entero"})
                 .positive({ message : "Ident. Escuela debe ser positivo"}),  
                 
    id : z.number({message : "Ident. Tipo debe ser numerico"})
                 .int({message : "Ident. Tipo debe ser entero"})
                 .positive({ message : "Ident. Tipo debe ser positivo"}),               
});

const EstadoEnum = z.enum(['activos', 'inactivos', 'todos']).default('activos');

export const EstadoTipoSchema = z.object({

    estado : EstadoEnum,

  
    id_escuela : z.number({message : "Ident. Escuela debe ser numerico"})
                 .int({message : "Ident. Escuela debe ser entero"})
                 .positive({ message : "Ident. Escuela debe ser positivo"}),  
                 
    id : z.number({message : "Ident. Tipo debe ser numerico"})
                 .int({message : "Ident. Tipo debe ser entero"})
                 .positive({ message : "Ident. Tipo debe ser positivo"}),               
})



export const ListaTipoUsuariosSchema = z.object({
        tipo   : z.string().optional().default(''), 

        estado        : EstadoEnum,  

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


export type CrearTipoInput = z.infer<typeof CrearTipoSchema>;
export type ModTipoInput = z.infer<typeof ModTipoSchema>;
export type EstadoTipoInput = z.infer<typeof EstadoTipoSchema>;
export type ListadoTipoInput = z.infer<typeof ListaTipoUsuariosSchema>;