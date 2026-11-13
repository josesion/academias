"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listaUsuariosSchema = exports.modContrasenaSchema = exports.modUsuarioSchemaPrivado = exports.modUsuarioSchema = exports.verificarUsuarioSchema = exports.crearUsuarioSchema = void 0;
// src/schemas/usuario.ts
const zod_1 = require("zod");
// Esquema para la creación de un nuevo usuario (cuando se registran)
exports.crearUsuarioSchema = zod_1.z.object({
    // 'usuario' es la PK, así que debe ser requerido en la creación
    usuario: zod_1.z.string()
        .min(4, { message: 'El nombre de usuario debe tener al menos 4 caracteres.' })
        .max(50, { message: 'El nombre de usuario no puede exceder los 50 caracteres.' }),
    // La contraseña se valida en el backend ANTES de hashearla,
    // y la longitud aquí es la de la contraseña en texto plano.
    // Es crucial no guardar la contraseña tal cual en la base de datos,
    // sino su hash. Zod valida el input del usuario.
    contrasena: zod_1.z.string({ message: "Debe ser una cadena de texto." })
        .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' }) // Ejemplo: mínimo 8 caracteres para seguridad
        .max(50, { message: 'La contraseña no puede exceder los 50 caracteres.' }), // Por si hay restricciones de input muy grandes
    nombre: zod_1.z.string({ message: "Debe ser una cadena de texto." })
        .min(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
        .max(100, { message: 'El nombre no puede exceder los 100 caracteres.' }),
    apellido: zod_1.z.string()
        .min(2, { message: 'El apellido debe tener al menos 2 caracteres.' })
        .max(100, { message: 'El apellido no puede exceder los 100 caracteres.' }),
    celular: zod_1.z.string()
        .max(20, { message: 'El celular no puede exceder los 20 caracteres.' })
        .optional() // Es opcional según tu tabla
        .or(zod_1.z.literal('')), // Permite también una cadena vacía si es opcional y no se envía.
    fecha_alta: zod_1.z.string()
        .min(10, { message: 'Esta mal la fecha de alta.' })
        .max(10, { message: 'Esta mal la fecha de alta.' }),
    // El rol por defecto será 'alumno' en la DB, pero podrías permitir enviarlo si es necesario
    rol: zod_1.z.string()
        .min(6, { message: 'El rol debe tener al menos 6 caracteres.' })
        .max(50, { message: 'El rol no puede exceder los 50 caracteres.' })
        .optional()
        .default('usuario'), // Coincide con el default de la DB, aunque Zod no lo inserta en la DB.
    // La fecha_alta la gestiona la DB automáticamente, no la pedimos en el input de creación.
    // Si la tuvieras que validar, sería z.coerce.date() o z.string().datetime()
    correo: zod_1.z.string()
        .email({ message: 'El formato del correo electrónico no es válido.' })
        .max(255, { message: 'El correo electrónico no puede exceder los 255 caracteres.' }),
    // El estado por defecto será 'activo' en la DB, no lo pedimos en el input de creación.
    estado: zod_1.z.string()
        .max(20, { message: 'El estado no puede exceder los 20 caracteres.' })
        .optional()
        .default('activos') // Coincide con el default de la DB
        .refine(val => ['activos', 'inactivos', 'pendientes', 'suspendidos'].includes(val), {
        message: 'El estado debe ser uno de los valores permitidos: activos, inactivos, pendientes, suspendidos.'
    }),
});
exports.verificarUsuarioSchema = zod_1.z.object({
    usuario: zod_1.z.string()
        .min(4, { message: 'El usuario debe tener al menos 4 caracteres.' })
        .max(50, { message: 'El usuario no puede exceder los 50 caracteres.' }),
});
exports.modUsuarioSchema = exports.crearUsuarioSchema
    .partial() // Hacemos TODOS los campos opcionales para permitir actualizaciones parciales
    .omit({
    usuario: true, // La clave primaria no se cambia
    contrasena: true, // La contraseña se maneja con un esquema separado por seguridad
    fecha_alta: true,
    rol: true,
    estado: true
    // Esta fecha es inmutable después de la creación
    // Puedes omitir otros campos si es necesario
});
exports.modUsuarioSchemaPrivado = exports.crearUsuarioSchema
    .partial() // Hacemos TODOS los campos opcionales para permitir actualizaciones parciales
    .omit({
    usuario: true, // La clave primaria no se cambia
    contrasena: true, // La contraseña se maneja con un esquema separado por seguridad
    fecha_alta: true,
    nombre: true,
    apellido: true,
    celular: true,
    correo: true
    // Esta fecha es inmutable después de la creación
    // Puedes omitir otros campos si es necesario
});
exports.modContrasenaSchema = zod_1.z.object({
    usuario: zod_1.z.string().min(4), // Validamos el usuario de la URL
    contrasena_actual: zod_1.z.string().min(8),
    contrasena_nueva: zod_1.z.string().min(8)
});
exports.listaUsuariosSchema = zod_1.z.object({
    // Campos para búsqueda parcial (LIKE)
    usuario: zod_1.z.string().trim().min(1, 'El usuario no puede estar vacío.').optional(),
    nombre: zod_1.z.string().trim().min(1, 'El nombre no puede estar vacío.').optional(),
    apellido: zod_1.z.string().trim().min(1, 'El apellido no puede estar vacío.').optional(),
    correo: zod_1.z.string().trim().min(1, 'El correo no puede estar vacío.').optional(),
    // Campos para búsqueda estricta (=)
    rol: zod_1.z.string().trim().min(1, 'El rol no puede estar vacío.').optional(),
    estado: zod_1.z.string()
        .max(20, { message: 'El estado no puede exceder los 20 caracteres.' })
        .optional()
        .default('activos') // Coincide con el default de la DB
        .refine(val => ['activos', 'inactivos', 'pendientes', 'suspendidos'].includes(val), {
        message: 'El estado debe ser uno de los valores permitidos: activos, inactivos, pendientes, suspendidos.'
    }),
    // Parámetros de paginación
    limit: zod_1.z.number({ message: "Limit debe ser de tipo numerico" })
        .int({ message: 'El limite debe ser un número entero.' })
        .positive({ message: 'El limite debe ser un número positivo.' }),
    offset: zod_1.z.number({ message: "Limit debe ser de tipo numerico" })
        .int({ message: 'El offset debe ser un número entero.' })
        .min(0, { message: 'El offset debe ser un número  mayor a 0.' })
});
//# sourceMappingURL=usuario.js.map