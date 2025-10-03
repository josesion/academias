// src/schemas/usuario.ts
import { z } from 'zod';

// Esquema para la creación de un nuevo usuario (cuando se registran)
export const crearUsuarioSchema = z.object({
  // 'usuario' es la PK, así que debe ser requerido en la creación
usuario: z.string()
            .min(4, { message: 'El nombre de usuario debe tener al menos 4 caracteres.' })
            .max(50, { message: 'El nombre de usuario no puede exceder los 50 caracteres.' }),

  // La contraseña se valida en el backend ANTES de hashearla,
  // y la longitud aquí es la de la contraseña en texto plano.
  // Es crucial no guardar la contraseña tal cual en la base de datos,
  // sino su hash. Zod valida el input del usuario.
contrasena: z.string({ message: "Debe ser una cadena de texto." })
               .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }) // Ejemplo: mínimo 8 caracteres para seguridad
               .max(50, { message: 'La contraseña no puede exceder los 50 caracteres.' }), // Por si hay restricciones de input muy grandes


nombre: z.string({ message: "Debe ser una cadena de texto." })
            .min(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
            .max(100, { message: 'El nombre no puede exceder los 100 caracteres.' }),

apellido: z.string()
            .min(2, { message: 'El apellido debe tener al menos 2 caracteres.' })
            .max(100, { message: 'El apellido no puede exceder los 100 caracteres.' }),

celular: z.string()
            .max(20, { message: 'El celular no puede exceder los 20 caracteres.' })
            .optional() // Es opcional según tu tabla
            .or(z.literal('')), // Permite también una cadena vacía si es opcional y no se envía.

fecha_alta: z.string()
            .min(10, { message: 'Esta mal la fecha de alta.' })
            .max(10, { message: 'Esta mal la fecha de alta.' }),

  // El rol por defecto será 'alumno' en la DB, pero podrías permitir enviarlo si es necesario
rol: z.string()
        .min(6, { message: 'El rol debe tener al menos 6 caracteres.' })
        .max(50, { message: 'El rol no puede exceder los 50 caracteres.' })
        .optional()
        .default('usuario'), // Coincide con el default de la DB, aunque Zod no lo inserta en la DB.

  // La fecha_alta la gestiona la DB automáticamente, no la pedimos en el input de creación.
  // Si la tuvieras que validar, sería z.coerce.date() o z.string().datetime()

correo: z.string()
        .email({ message: 'El formato del correo electrónico no es válido.' })
        .max(255, { message: 'El correo electrónico no puede exceder los 255 caracteres.' }),

  // El estado por defecto será 'activo' en la DB, no lo pedimos en el input de creación.
estado: z.string()
        .max(20, { message: 'El estado no puede exceder los 20 caracteres.' })
        .optional()
        .default('activos') // Coincide con el default de la DB
        .refine(val => ['activos', 'inactivos', 'pendientes', 'suspendidos'].includes(val), {
            message: 'El estado debe ser uno de los valores permitidos: activos, inactivos, pendientes, suspendidos.'
        }),

id_escuela : z.number({message:"el ID de escuela debe ser numerico"})
            .min(1, { message: 'el ID de escuela debe tener al menos un digito' })
});

export const verificarUsuarioSchema = z.object({
  usuario: z.string()
            .min(4, { message: 'El usuario debe tener al menos 4 caracteres.' })
            .max(50, { message: 'El usuario no puede exceder los 50 caracteres.' }),
})



export const modUsuarioSchema = crearUsuarioSchema
  .partial() // Hacemos TODOS los campos opcionales para permitir actualizaciones parciales
  .omit({   // Excluimos los campos que NUNCA deben ser modificados por el cliente
    usuario: true,      // La clave primaria no se cambia
    contrasena: true,   // La contraseña se maneja con un esquema separado por seguridad
    fecha_alta: true, 
    rol : true,
    estado : true
    // Esta fecha es inmutable después de la creación
    // Puedes omitir otros campos si es necesario
  });


export const modUsuarioSchemaPrivado = crearUsuarioSchema
  .partial() // Hacemos TODOS los campos opcionales para permitir actualizaciones parciales
  .omit({   // Excluimos los campos que NUNCA deben ser modificados por el cliente
    usuario: true,      // La clave primaria no se cambia
    contrasena: true,   // La contraseña se maneja con un esquema separado por seguridad
    fecha_alta: true, 
    nombre    : true,
    apellido  : true,
    celular   : true,
    correo    : true
    // Esta fecha es inmutable después de la creación
    // Puedes omitir otros campos si es necesario
  });


export const modContrasenaSchema = z.object({
  usuario: z.string().min(4), // Validamos el usuario de la URL
  contrasena_actual: z.string().min(8),
  contrasena_nueva: z.string().min(8)
});


export const listaUsuariosSchema = z.object({
  // Campos para búsqueda parcial (LIKE)
  usuario: z.string().trim().min(1, 'El usuario no puede estar vacío.').optional(),
  nombre: z.string().trim().min(1, 'El nombre no puede estar vacío.').optional(),
  apellido: z.string().trim().min(1, 'El apellido no puede estar vacío.').optional(),
  correo: z.string().trim().min(1, 'El correo no puede estar vacío.').optional(),

  // Campos para búsqueda estricta (=)
  rol: z.string().trim().min(1, 'El rol no puede estar vacío.').optional(),
  estado: z.string()
        .max(20, { message: 'El estado no puede exceder los 20 caracteres.' })
        .optional()
        .default('activos') // Coincide con el default de la DB
        .refine(val => ['activos', 'inactivos', 'pendientes', 'suspendidos'].includes(val), {
            message: 'El estado debe ser uno de los valores permitidos: activos, inactivos, pendientes, suspendidos.'
        }),

  // Parámetros de paginación
          limit : z.number({message:"Limit debe ser de tipo numerico"})
                .int({ message: 'El limite debe ser un número entero.' })
                .positive({ message: 'El limite debe ser un número positivo.' }),
          offset :z.number({message:"Limit debe ser de tipo numerico"})
                .int({ message: 'El offset debe ser un número entero.' })
                .min(0, { message: 'El offset debe ser un número  mayor a 0.' })
});


export type CrearInputsUsuario = z.infer<typeof crearUsuarioSchema>;
export type VerificarUsuario   = z.infer<typeof verificarUsuarioSchema>;
export type ModInputsUsuario   = z.infer<typeof modUsuarioSchema>;
export type ModInputsUsuarioPriv   = z.infer<typeof modUsuarioSchemaPrivado>;
export type ModInputsContrasena= z.infer<typeof modContrasenaSchema>;
export type FiltroUsuarios = z.infer<typeof listaUsuariosSchema>;
