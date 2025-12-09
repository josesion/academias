import { z } from 'zod';
// pagos para usuarios

export const ExistenciaPlanSchema = z.object({
        descripcion: z.string({message : "descripcion debe ser texto" })
        .trim()
        .min(1, { message: "La descripción del plan es requerida." }) 
        .min(3, { message: "La descripción debe tener al menos 3 caracteres" }),
});

export const CrearPlanesPagoSchema = z.object({
    
    // Campo de texto simple
    descripcion: z.string({ 
        message : "La descripción debe ser texto." 
    })
    .trim()
    .min(1, { message: "La descripción del plan es requerida." }) 
    .min(3, { message: "La descripción debe tener al menos 3 caracteres. (Solo Plan Maestro)" }),
    
    cantidad_clases: z.number({ message : "Cantidad de clases debe ser numerico"})
                    .refine(val => val !== 0, { message: "La Cantidad de Clases no puede estar vacía o ser cero."})
                    .int( {message : "Cantidad de clases debe ser entero"} )
                    .positive({message : "Cantidad de clases debe ser positivo"}),

    cantidad_meses: z.number({ message : "Cantidad de meses debe ser numerico"})
                    .refine(val => val !== 0, { message: "La Cantidad de Meses no puede estar vacía o ser cero."})
                    .int( {message : "Cantidad de Meses debe ser entero"} )
                    .positive({message : "Cantidad de Meses debe ser positivo"}),
    
    // Campo que maneja decimales o flotantes (monto)
    monto: z.coerce.number( { 
        message :"El monto debe ser Numérico"
    }) 
    .positive("El monto debe ser un valor positivo."), 
    
    // Campo con valor por defecto
    estado: z.string()
            .default('activos'), 
});

export const CrearPlanesEscuelasSchema = z.object({
    
    // Campo id_escuela (Recibido del body, debe usar coerce)
    id_escuela : z.coerce.number({ 
        message : "Ident. Escuela debe ser numérico"
    })
    .int({message : "Ident. Escuela debe ser entero"})
    .positive({ message : "Ident. Escuela debe ser positivo"}),

    // Campo id_plan (Recibido o generado, debe ser número)
    id_plan : z.number({ // No usamos coerce aquí si idPlan viene de la DB (number)
        message : "Ident. Plan debe ser numérico"
    })
    .int({message : "Ident. Plan debe ser entero"})
    .positive({ message : "Ident. Plan debe ser positivo"}),
    
    // Campo con valor por defecto
    estado: z.string()
            .default('activos'),
            
    // Campo de texto simple para la asignación
    descripcion : z.string({ 
        message : "descripcion debe ser texto" 
    })
    .trim()
    .min(1, { message: "La descripción de la asignación es requerida." }) 
    .min(3, { message: "La descripción debe tener al menos 3 caracteres. (Plan Escuela)" }), 
    
    // Campo de fecha (asumiendo que se recibe como string 'YYYY-MM-DD')
    fecha_creacion : z.string({ 
        message: "La fecha de creación es requerida" 
    })
    .trim()
    .min(10 , { message : "Verificar Formato de fecha (YYYY-MM-DD)" }),

    cantidad_clases: z.number( { 
        message :"Cantidad de clases debe ser numérico"
    }) 
    .refine(val => val !== 0, { // Intercepta el 0 resultante de la cadena vacía
        message: "La Cantidad de Clases no puede estar vacía o ser cero."
    })
    .int({ message: "Cantidad de clases debe ser entero" })
    .positive("Cantidad de clases debe ser un valor positivo."), 

    cantidad_meses: z.number({ message : "Cantidad de meses debe ser numerico"})
                    .refine(val => val !== 0, { message: "La Cantidad de Meses no puede estar vacía o ser cero."})
                    .int( {message : "Cantidad de Meses debe ser entero"} )
                    .positive({message : "Cantidad de Meses debe ser positivo"}),
    
    monto: z.number( { 
        message :"El monto debe ser Numérico"
    }) 
    .positive("El monto debe ser un valor positivo."), 
});

export const ModPlanesUsuarios = z.object({
    id_escuela :    z.number({message : "Ident. Escuela debe ser numerico"})
                    .int({message : "Ident. Escuela debe ser entero"})
                    .positive({ message : "Ident. Escuela debe ser positivo"}),

    id_plan :       z.number({message : "Ident. Plan debe ser numerico"})
                    .int({message : "Ident. Plan debe ser entero"})
                    .positive({ message : "Ident. Plan debe ser positivo"}),


                
    nombre_personalizado : z.string({message : "descripcion debe ser texto" })
                    .trim()
                    .min(1, { message: "La descripción del plan es requerida." }) 
                    .min(3, { message: "La descripción debe tener al menos 3 caracteres." }),               
    
    fecha_creacion :z.string()
                    .trim()
                    . min(10 , { message : "Verificar Formato de fecha" }),

    cantidad_clases: z.number({ message : "Cantidad de clases debe ser numerico"})
                    .refine(val => val !== 0, { message: "La Cantidad de Clases no puede estar vacía o ser cero."})
                    .int( {message : "Cantidad de clases debe ser entero"} )
                    .positive({message : "Cantidad de clases debe ser positivo"}),

    cantidad_meses: z.number({ message : "Cantidad de meses debe ser numerico"})
                    .refine(val => val !== 0, { message: "La Cantidad de Meses no puede estar vacía o ser cero."})
                    .int( {message : "Cantidad de Meses debe ser entero"} )
                    .positive({message : "Cantidad de Meses debe ser positivo"}),

    
  monto:  z.coerce.number( { message :"El monto debe ser Numérico"}) 
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

export const ListaPlanesUsuarioSinPagSchema = z.object({
        descripcion   : z.string().optional().default(''), 

        estado        : EstadoPlanEnum,  

        id_escuela  :    z.number({message : "Ident. Escuela debe ser numerico"})
                    .int({message : "Ident. Escuela debe ser entero"})
                    .positive({ message : "Ident. Escuela debe ser positivo"}),
});

// Tipos de TypeScript
export type ExistenciaPlanesInputs      = z.infer<typeof ExistenciaPlanSchema>;
export type PlanesPagoInputs            = z.infer<typeof CrearPlanesPagoSchema>;
export type PlanesEscuelasInputs        =  z.infer<typeof CrearPlanesEscuelasSchema>;
export type ModPlanesUsuariosInputs     = z.infer<typeof ModPlanesUsuarios>;
export type estadoPlanesUsuariosInputs  = z.infer<typeof EstadoPlanesUsuariosSchema>;
export type ListaPlanesUsuariosInputs   = z.infer<typeof ListaPlanesUsuariosSchema>;
export type ListaPlanesUsuarioSinPagInputs   = z.infer<typeof ListaPlanesUsuarioSinPagSchema>;
