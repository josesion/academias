import { z } from 'zod';
// pagos para usuarios

export const ExistenciaPlanSchema = z.object({
        descripcion: z.string({message : "descripcion debe ser texto" })
        .trim()
        .min(1, { message: "La descripción del plan es requerida." }) 
        .min(3, { message: "La descripción debe tener al menos 3 caracteres." }),
});

export const CrearPlanesPagoSchema = z.object({
    
    descripcion: z.string({message : "descripcion debe ser texto" })
        .trim()
        .min(1, { message: "La descripción del plan es requerida." }) 
        .min(3, { message: "La descripción debe tener al menos 3 caracteres." }),
    
    cantidad_clases: z.number({ message : "Cantidad de clases debe ser numerico"})
                    .int( {message : "Cantidad de clases debe ser entero"} )
                    .positive({message : "Cantidad de clases debe ser psotivo"}),

    cantidad_meses: z.number()
                    .int()
                    .positive()
                    .default(1),
    
    monto:  z.number( { message :"El monto debe ser Numerico"})
            .positive("El monto debe ser un valor positivo."), 
    
    estado: z.string()
            .default('activos'), 
});

export const CrearPlanesEscuelasSchema = z.object({
    id_escuela :    z.number({message : "Ident. Escuela debe ser numerico"})
                    .int({message : "Ident. Escuela debe ser entero"})
                    .positive({ message : "Ident. Escuela debe ser positivo"}),

    id_plan :       z.number({message : "Ident. Plan debe ser numerico"})
                    .int({message : "Ident. Plan debe ser entero"})
                    .positive({ message : "Ident. Plan debe ser positivo"}),

    estado:         z.string()
                    .default('activos'),
                    
    nombre_personalizado : z.string({message : "descripcion debe ser texto" })
                    .trim()
                    .min(1, { message: "La descripción del plan es requerida." }) 
                    .min(3, { message: "La descripción debe tener al menos 3 caracteres." }),               
    
    fecha_creacion :z.string()
                    .trim()
                    . min(10 , { message : "Verificar Formato de fecha" }),

    cantidad_clases: z.number({ message : "Cantidad de clases debe ser numerico"})
                    .int( {message : "Cantidad de clases debe ser entero"} )
                    .positive({message : "Cantidad de clases debe ser psotivo"}),

    cantidad_meses: z.number()
                    .int()
                    .positive()
                    .default(1),
    
    monto:  z.number( { message :"El monto debe ser Numerico"})
            .positive("El monto debe ser un valor positivo."),                     

});

export const ModPlanesUsuarios = z.object({
    id_escuela :    z.number({message : "Ident. Escuela debe ser numerico"})
                    .int({message : "Ident. Escuela debe ser entero"})
                    .positive({ message : "Ident. Escuela debe ser positivo"}),

    id_plan :       z.number({message : "Ident. Plan debe ser numerico"})
                    .int({message : "Ident. Plan debe ser entero"})
                    .positive({ message : "Ident. Plan debe ser positivo"}),

    estado:         z.string()
                    .default('activos'),
                    
    nombre_personalizado : z.string({message : "descripcion debe ser texto" })
                    .trim()
                    .min(1, { message: "La descripción del plan es requerida." }) 
                    .min(3, { message: "La descripción debe tener al menos 3 caracteres." }),               
    
    fecha_creacion :z.string()
                    .trim()
                    . min(10 , { message : "Verificar Formato de fecha" }),

    cantidad_clases: z.number({ message : "Cantidad de clases debe ser numerico"})
                    .int( {message : "Cantidad de clases debe ser entero"} )
                    .positive({message : "Cantidad de clases debe ser psotivo"}),

    cantidad_meses: z.number()
                    .int()
                    .positive()
                    .default(1),
    
    monto:  z.number( { message :"El monto debe ser Numerico"})
            .positive("El monto debe ser un valor positivo."),   
});

const EstadosPermitidos = z.enum(['activos', 'inactivos'],
                         {message : "Estado debe ser activos o inactivos"} );

export const EstadoPlanesUsuariosSchema = z.object({
    id_escuela :    z.number({message : "Ident. Escuela debe ser numerico"})
                    .int({message : "Ident. Escuela debe ser entero"})
                    .positive({ message : "Ident. Escuela debe ser positivo"}),

    id_plan :       z.number({message : "Ident. Plan debe ser numerico"})
                    .int({message : "Ident. Plan debe ser entero"})
                    .positive({ message : "Ident. Plan debe ser positivo"}),

    estado:         EstadosPermitidos
                    .default('activos'), 
});

const EstadoPlanEnum = z.enum(['activos', 'inactivos', 'todos']).default('activos');

export const ListaPlanesUsuariosSchema = z.object({
        descripcion   : z.string().optional().default(''), 

        estado        : EstadoPlanEnum,  

        id_escuela  :    z.number({message : "Ident. Escuela debe ser numerico"})
                    .int({message : "Ident. Escuela debe ser entero"})
                    .positive({ message : "Ident. Escuela debe ser positivo"}),

        limite: z.coerce.number().int().min(1).default(10), 
        offset: z.coerce.number().int().min(0).default(0),     
});

// Tipos de TypeScript
export type ExistenciaPlanesInputs      = z.infer<typeof ExistenciaPlanSchema>;
export type PlanesPagoInputs            = z.infer<typeof CrearPlanesPagoSchema>;
export type PlanesEscuelasInputs        =  z.infer<typeof CrearPlanesEscuelasSchema>;
export type ModPlanesUsuariosInputs     = z.infer<typeof ModPlanesUsuarios>;
export type estadoPlanesUsuariosInputs  = z.infer<typeof EstadoPlanesUsuariosSchema>;
export type ListaPlanesUsuariosInputs   = z.infer<typeof ListaPlanesUsuariosSchema>;
