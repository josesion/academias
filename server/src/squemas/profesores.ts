import { z } from "zod";

export const CrearProfesorSchema = z.object({
dni: z
    .string()
    .min(8, { message: "El DNI debe tener los 8 digitos" })
    .max(20, { message: "El DNI no puede superar los 8 digitos" })
    .regex(/^[0-9]+$/, {
      message: "El DNI solo puede contener números",
    }),

nombre: z
    .string()
    .trim() // ✨ ¡Aplicar .trim() aquí para quitar espacios antes de validar!
    .min(4, { message: "El nombre debe tener 6 caracteres min." }) 
    .max(100, { message: "El nombre no puede superar los 100 caracteres" })
    .transform((val) => val.trim()),

  apellido: z
    .string()
    .min(6, { message: "El apellido debe tener 6 caracteres min." })
    .max(100, { message: "El apellido no puede superar los 100 caracteres" })
    .transform((val) => val.trim()),

celular: z
  .string()
  .max(20, { message: "El celular no puede superar los 20 caracteres" })
  .regex(/^[0-9]+$/, {
    message: "El celular solo puede contener números",
  })
  .or(z.literal("").transform(() => null)) // ⬅️ transforma string vacío a null
  .nullable(), // ⬅️ asegura que el tipo final sea string | null


  estado: z
    .string()
    .max(20, { message: "El campo 'baja' no puede superar los 20 caracteres" })
    .default("activos")
    .refine((val) => ["activos", "inactivos", "baja", "suspendido"].includes(val), {
      message:
        "El estado 'baja' debe ser uno de: activos, inactivos, baja o suspendido",
    }),


});


export const CrearProfesorEscuelaSchema = z.object({
  dni: z
    .string()
    .min(1, { message: "El DNI del profesor es obligatorio" })
    .max(20, { message: "El DNI del profesor no puede superar los 20 caracteres" })
    .regex(/^[0-9]+$/, {
      message: "El DNI solo puede contener números",
    }),

  id_escuela: z
    .number({
       message : "El ID de la escuela debe ser un número",
    })
    .int({ message: "El ID de la escuela debe ser un número entero" })
    .nonnegative({ message: "El ID de la escuela no puede ser negativo" }),

  estado: z
    .string()
    .max(20, { message: "El estado no puede superar los 20 caracteres" })
    .default("activos")
    .refine(
      (val) => ["activos", "inactivos", "baja", "suspendido"].includes(val),
      {
        message:
          "El estado debe ser uno de: activos, inactivos, baja o suspendido",
      }
    ),

  fecha_creacion: z
    .string()
    .min(1, { message: "La fecha de creación es obligatoria" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message:
        "La fecha de creación debe tener formato YYYY-MM-DD (por ejemplo: 2025-11-05)",
    })
    .transform((val) => val.trim()),

  fecha_baja: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message:
        "La fecha de baja debe tener formato YYYY-MM-DD (por ejemplo: 2025-11-05)",
    })
    .or(z.literal("").transform(() => null)) // permite cadena vacía → null
    .nullable()
    .optional(),
});

export const  ModProfesoresSchema = z.object({
dni: z
    .string()
    .min(8, { message: "El DNI debe tener 8 digitos" })
    .max(8, { message: "El DNI no puede superar los 8 digitos" })
    .regex(/^[0-9]+$/, {
      message: "El DNI solo puede contener números",
    }),

  nombre: z
    .string()
    .min(4, { message: "El nombre debe tener 6 caracteres min." })
    .max(100, { message: "El nombre no puede superar los 100 caracteres" })
    .transform((val) => val.trim()),

  apellido: z
    .string()
    .min(6, { message: "El apellido debe tener 6 caracteres min." })
    .max(100, { message: "El apellido no puede superar los 100 caracteres" })
    .transform((val) => val.trim()),

celular: z
  .string()
  .max(20, { message: "El celular no puede superar los 20 caracteres" })
  .regex(/^[0-9]+$/, {
    message: "El celular solo puede contener números",
  })
  .or(z.literal("").transform(() => null)) // ⬅ transforma string vacío a null
  .nullable(), // ⬅️ asegura que el tipo final sea string | null 
});

export const EstadoProfesorSchema = z.object({
  dni: z
    .string()
    .min(8, { message: "El DNI debe tener los 8 digitos" })
    .max(20, { message: "El DNI no puede superar los 8 digitos" })
    .regex(/^[0-9]+$/, {
      message: "El DNI solo puede contener números",
    }),

   id_escuela: z
    .number({
       message : "El ID de la escuela debe ser un número",
    })
    .int({ message: "El ID de la escuela debe ser un número entero" })
    .nonnegative({ message: "El ID de la escuela no puede ser negativo" }),
    
  estado: z
    .string()
    .max(20, { message: "El estado no puede superar los 20 caracteres" })
    .default("activos")
    .refine(
      (val) => ["activos", "inactivos", "baja", "suspendido"].includes(val),
      {
        message:
          "El estado debe ser uno de: activos, inactivos, baja o suspendido",
      }
    ),

});

const EstadoPlanEnum = z.enum(['activos', 'inactivos', 'todos']).default('activos');

export const ListaProfeUsuariosSchema = z.object({
        dni   : z.string().optional().default(''), 

        apellido   : z.string().optional().default(''),

        estado        : EstadoPlanEnum,  

        id_escuela  :    z.number({message : "Ident. Escuela debe ser numerico"})
                    .int({message : "Ident. Escuela debe ser entero"})
                    .positive({ message : "Ident. Escuela debe ser positivo"}),

        limit: z.coerce.number().int().min(1).default(10), 
        offset: z.coerce.number().int().min(0).default(0),     
});

export const ListaProfeUsuarioSinPagSchema = z.object({
        dni   : z.string().optional().default(''), 

        estado        : EstadoPlanEnum,  

        id_escuela  :    z.number({message : "Ident. Escuela debe ser numerico"})
                    .int({message : "Ident. Escuela debe ser entero"})
                    .positive({ message : "Ident. Escuela debe ser positivo"}),     
});

export type ProfesorEscuelaInputs = z.infer<typeof CrearProfesorEscuelaSchema>;
export type ProfesorInputs = z.infer< typeof CrearProfesorSchema >;
export type ModProfesorInputs = z.infer< typeof ModProfesoresSchema >;
export type EstadoProfesorInputs = z.infer< typeof EstadoProfesorSchema >;
export type ListadoProfeInputs = z.infer< typeof ListaProfeUsuariosSchema >;
export type ListadoProfeSinPagInputs = z.infer< typeof ListaProfeUsuarioSinPagSchema >;