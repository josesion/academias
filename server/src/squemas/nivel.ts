import { z } from "zod";

export const CrearNivelSchema = z.object({
    nivel : z.string({ message: "Nivel debe ser texto" })
            .trim()
            .min(6, { message: "El nivel es requerido." }) 
            .max( 20 , { message: "El nivel debe tener al menos 15 caracteres." }),

    fecha_creacion :z.string({ message: "La fecha de creación es requerida" })
           .trim()
           .min(10 , { message : "Verificar Formato de fecha (YYYY-MM-DD)" }),

    is_default : z.boolean({ message : "is_default debe ser booleano"})
                  .default(false),
    
    id_escuela : z.number({message : "Ident. Escuela debe ser numerico"})
                 .int({message : "Ident. Escuela debe ser entero"})
                 .positive({ message : "Ident. Escuela debe ser positivo"}),                
});

export const ModificarNivelSchema = z.object({

    id : z.number({ message: "Identificador de nivel debe ser numérico." })
            .int({ message: "Identificador de nivel debe ser un entero." })
            .positive({ message: "Identificador de nivel debe ser positivo." }),    
    
    nivel : z.string({ message: "Nivel debe ser texto" })
            .trim()
            .min(6, { message: "El nivel es requerido." }) 
            .max( 20 , { message: "El nivel debe tener al menos 15 caracteres." }),

    id_escuela : z.number({message : "Ident. Escuela debe ser numerico"})
                 .int({message : "Ident. Escuela debe ser entero"})
                 .positive({ message : "Ident. Escuela debe ser positivo"}),
});


const EstadosPermitidos = z.enum(['activos', 'inactivos'],
                         {message : "Estado debe ser activos o inactivos"} );

export const EstadoNivelSchema = ModificarNivelSchema.extend({

    estado:        EstadosPermitidos
                .default('activos'),                

});

const EstadoPlanEnum = z.enum(['activos', 'inactivos', 'todos']).default('activos');

export const ListaNivelesUsuariosSchema = z.object({
        nivel   : z.string().optional().default(''), 

        estado        : EstadoPlanEnum,  

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

export type CrearNivelInput = z.infer<typeof CrearNivelSchema>;
export type ModificarNivelInput = z.infer<typeof ModificarNivelSchema>;
export type EstadoNivelInput   = z.infer<typeof EstadoNivelSchema>;
export type ListadoNivelInput  =  z.infer<typeof ListaNivelesUsuariosSchema>;