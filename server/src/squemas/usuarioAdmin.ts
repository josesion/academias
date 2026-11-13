import { z } from "zod";

// --- 1. ESQUEMA PARA LISTADO (GET) ---
// `rol` lo hardcodea el servicio ('alumno' | 'usuario') antes del .parse():
// el enum garantiza que a la SQL nunca llegue ningún otro valor.
export const EsquemaListadoUsuarioAdmin = z.object({
  pagina: z.coerce.number({ message: "pagina debe ser de tipo numerico" })
        .int({ message: "pagina debe ser un número entero." })
        .min(1, { message: "pagina debe ser un número mayor o igual a 1." })
        .default(1),

  limit: z.coerce.number({ message: "limit debe ser de tipo numerico" })
        .int({ message: "limit debe ser un número entero." })
        .positive({ message: "limit debe ser un número positivo." })
        .default(10),

  // Opcional: sin el parámetro el listado trae TODAS las escuelas (LIKE '%')
  id_escuela: z.coerce.number({ message: "id_escuela debe ser de tipo numerico" })
        .int({ message: "id_escuela debe ser un número entero." })
        .positive({ message: "id_escuela debe ser un número positivo." })
        .optional(),

  // Fijado por cada servicio: NO viaja en la query ni en el body
  rol: z.enum(['alumno', 'usuario'], { message: "rol debe ser 'alumno' o 'usuario'." })
});

// --- 2. ESQUEMA PARA CREAR (POST) ---
// La contraseña llega en TEXTO PLANO: acá solo se valida su longitud. El hasheado
// con bcrypt lo hace la capa `data` ANTES del INSERT; el hash nunca se guarda ni
// se devuelve en la respuesta.
export const EsquemaCrearUsuarioAdmin = z.object({
  usuario: z.string({ message: "Debe ser una cadena de texto." })
        .min(4, { message: "El usuario debe tener al menos 4 caracteres." })
        .max(50, { message: "El usuario no puede exceder los 50 caracteres." }),

  contrasena: z.string({ message: "Debe ser una cadena de texto." })
        .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
        .max(50, { message: "La contraseña no puede exceder los 50 caracteres." }),

  nombre: z.string({ message: "Debe ser una cadena de texto." })
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(100, { message: "El nombre no puede exceder los 100 caracteres." }),

  apellido: z.string({ message: "Debe ser una cadena de texto." })
        .min(2, { message: "El apellido debe tener al menos 2 caracteres." })
        .max(100, { message: "El apellido no puede exceder los 100 caracteres." }),

  // Opcional: la columna en la BD también es NULL
  celular: z.string()
        .max(20, { message: "El celular no puede exceder los 20 caracteres." })
        .optional(),

  correo: z.string({ message: "Debe ser una cadena de texto." })
        .email({ message: "El formato del correo electrónico no es válido." })
        .max(255, { message: "El correo no puede exceder los 255 caracteres." }),

  // Solo dos roles fijos: 'alumno' | 'usuario'. El backend no admite ningún otro valor.
  rol: z.enum(['alumno', 'usuario'], { message: "rol debe ser 'alumno' o 'usuario'." }),

  // Viene del body: el frontend lo manda en el formulario de alta (Ver el JSDoc
  // del controlador `crear` y el ticket de decisión en MEMORY.md).
  id_escuela: z.number({ message: "el ID de escuela debe ser numerico" })
        .min(1, { message: "el ID de escuela debe tener al menos un digito" })
});

// --- 3. ESQUEMA PARA ACTUALIZAR (PUT) ---
// El identificador (`id_usuario`) SIEMPRE viaja: es el único que usa el WHERE.
// Todo lo demás es OPCIONAL: lo que no llega no se modifica (el SET se arma
// dinámicamente en la capa `data`). Fuera del alcance: `rol`, `estado`,
// `id_escuela` y `fecha_alta` (no se tocan).
// La contraseña llega en TEXTO PLANO: la hashea la `data` con bcrypt ANTES del
// UPDATE, igual que en el alta; el hash jamás se guarda ni se devuelve.
export const EsquemaActualizarUsuarioAdmin = z.object({
  id_usuario: z.number({ message: "id_usuario debe ser de tipo numerico" })
        .int({ message: "id_usuario debe ser un número entero." })
        .positive({ message: "id_usuario debe ser un número positivo." }),

  usuario: z.string({ message: "Debe ser una cadena de texto." })
        .min(4, { message: "El usuario debe tener al menos 4 caracteres." })
        .max(50, { message: "El usuario no puede exceder los 50 caracteres." })
        .optional(),

  contrasena: z.string({ message: "Debe ser una cadena de texto." })
        .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
        .max(50, { message: "La contraseña no puede exceder los 50 caracteres." })
        .optional(),

  nombre: z.string({ message: "Debe ser una cadena de texto." })
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(100, { message: "El nombre no puede exceder los 100 caracteres." })
        .optional(),

  apellido: z.string({ message: "Debe ser una cadena de texto." })
        .min(2, { message: "El apellido debe tener al menos 2 caracteres." })
        .max(100, { message: "El apellido no puede exceder los 100 caracteres." })
        .optional(),

  celular: z.string()
        .max(20, { message: "El celular no puede exceder los 20 caracteres." })
        .optional(),

  correo: z.string({ message: "Debe ser una cadena de texto." })
        .email({ message: "El formato del correo electrónico no es válido." })
        .max(255, { message: "El correo no puede exceder los 255 caracteres." })
        .optional(),

  // Un PUT sin nada que cambiar no tiene sentido: si solo llega `id_usuario`
  // (o nada), el SET quedaría vacío y la SQL sería inválida.
}).refine(
  (campos) => Boolean( campos.usuario ?? campos.contrasena ?? campos.nombre ??
                       campos.apellido ?? campos.celular ?? campos.correo ),
  { message: "Debe enviar al menos un campo a modificar." }
);

// --- 4. ESQUEMA PARA ELIMINAR (DELETE) — baja lógica ---
// No borra la fila: cambia `usuarios.estado` entre 'inactivos' (baja) y
// 'activos' (reactivación), por eso viajan DOS datos:
//   - `id_usuario`: a QUIÉN se le cambia el estado (lo manda el cliente).
//   - `estado`    : qué estado se le pone; `z.enum` no deja pasar otro texto.
//   - `id_propio` : QUIÉN pide la operación. Lo inyecta el controlador desde
//     `req.usuario.id` (el token), NUNCA viene del cliente: sirve para que un
//     administrador no se dé de baja a sí mismo por un clic equivocado.
//     Fuera de alcance (igual que en el PUT): `rol`, `id_escuela`, `fecha_alta`.
export const EsquemaEliminarUsuarioAdmin = z.object({
  id_usuario: z.number({ message: "id_usuario debe ser de tipo numerico" })
        .int({ message: "id_usuario debe ser un número entero." })
        .positive({ message: "id_usuario debe ser un número positivo." }),

  estado: z.enum(["activos", "inactivos"], {
        message: "estado debe ser 'activos' o 'inactivos'."
  }),

  id_propio: z.number({ message: "id_propio debe ser de tipo numerico" })
        .int({ message: "id_propio debe ser un número entero." })
        .positive({ message: "id_propio debe ser un número positivo." }),
});

export type ListadoUsuarioAdminInput = z.infer<typeof EsquemaListadoUsuarioAdmin>;
export type InputCrearUsuarioAdmin = z.infer<typeof EsquemaCrearUsuarioAdmin>;
export type InputActualizarUsuarioAdmin = z.infer<typeof EsquemaActualizarUsuarioAdmin>;
export type InputEliminarUsuarioAdmin = z.infer<typeof EsquemaEliminarUsuarioAdmin>;

/** Lo que llega desde `req.query`: todo lo del listado MENOS el `rol`, que lo fija cada servicio. */
export type ListadoUsuarioAdminQuery = Omit<ListadoUsuarioAdminInput, 'rol'>;

/** Lo que recibe la `data`: lo ya validado por Zod + el `offset` calculado en el servicio. */
export type ListadoPorRol = ListadoUsuarioAdminInput & { offset: number };
