import { z } from 'zod';

export const CuentaEscuelaSchema = z.object({
  // .positive() asegura que el ID sea mayor a 0
//  id_cuenta: z.number().positive("ID inválido").optional(),
  
  // El ID de escuela siempre debe ser un número positivo
  id_escuela: z.number().positive("ID de escuela requerido"),

  // Mínimo 4 caracteres para el nombre de la cuenta
  nombre_cuenta: z.string().min(4, "Mínimo 4 caracteres"),

  // Enums limpios para MySQL
  tipo_cuenta: z.enum(['fisico', 'virtual']),
  
  // Tu regla de oro: 'activos' o 'inactivos'
  estado: z.enum(['activos', 'inactivos']).default('activos'),
});

export const ModificarCuentaEscuelaSchema = z.object({
  id_cuenta: z.number().positive("ID inválido"),
  id_escuela: z.number().positive("ID de escuela requerido"),

  // Mínimo 4 caracteres para el nombre de la cuenta
  nuevo_nombre_cuenta: z.string().min(4, "Mínimo 4 caracteres"),

  // Enums limpios para MySQL
  nuevo_tipo_cuenta: z.enum(['fisico', 'virtual']),    
});

export const EstadoCuentasSchema = z.object({

   estado: z.enum(['activos', 'inactivos']).default('activos'), 

   id_cuenta: z.number().positive("ID inválido"),

   id_escuela: z.number().positive("ID de escuela requerido"),

});

export const ListadoCuentasSchema = z.object ({
    nombre_cuenta : z.string({ message: "Nivel debe ser texto" })
                    .trim()
                    .max( 20 , { message: "El nivel debe tener al menos 15 caracteres." }),

    tipo_cuenta: z.enum(['fisico', 'virtual', "todos"]),

    pagina : z.coerce.number().int().min(1).default(1), 

    estado : z.enum(['activos', 'inactivos']),

    id_escuela : z.number({message : "Ident. Escuela debe ser numerico"})
                 .int({message : "Ident. Escuela debe ser entero"})
                 .positive({ message : "Ident. Escuela debe ser positivo"}),   

    limite: z.coerce.number()
            .int("El limite debe ser un numero entero.")
            .nonnegative("El limite no puede ser negativo.")
            .default(20),
        
    offset: z.coerce.number()
            .int("El offset debe ser un numero entero.")
            .nonnegative("El offset no puede ser negativo.")
            .default(0)     
});

export type CuentaEscuelaInput = z.infer<typeof CuentaEscuelaSchema>;
export type ModificarCuentaEscuelaUnputs = z.infer<typeof ModificarCuentaEscuelaSchema>;
export type EstadoCuentasInputs = z.infer<typeof EstadoCuentasSchema>;
export type ListadoCuentasInputs = z.infer<typeof ListadoCuentasSchema >;