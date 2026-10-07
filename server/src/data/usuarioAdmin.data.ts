import bcrypt from "bcryptjs";
import { tryCatchDatos } from "../utils/tryCatchBD";
import { listarEntidad } from "../hooks/funcionListar";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { TipadoData } from "../tipados/tipado.data";
import { InputCrearUsuarioAdmin, InputActualizarUsuarioAdmin, InputEliminarUsuarioAdmin, ListadoPorRol } from "../squemas/usuarioAdmin";

export interface FilaUsuarioAdmin {
  id_usuario: number;
  usuario: string;
  nombre: string;
  apellido: string;
  celular: string | null;
  correo: string;
  rol: "alumno" | "usuario" | "administrador";
  estado: string;
  fecha_alta: string | Date;
  id_escuela: number;
}

export interface DataCrearResultUsuarioAdmin {
  usuario: string;
  correo: string;
}

export interface DataActualizarResultUsuarioAdmin {
  id_usuario: number;
  /** Devuelve el login solo si la modificación lo cambió; si no viaja, queda ausente. */
  usuario?: string;
}

export interface DataEliminarResultUsuarioAdmin {
  /** Id de la cuenta cuyo estado cambió. */
  id_usuario: number;
  /** Estado resultante: `'inactivos'` (baja) o `'activos'` (reactivación). */
  estado: string;
}

/**
 * Listado de usuarios de la tabla `usuarios` filtrado por rol (fijo por ruta) y,
 * de forma opcional, por escuela.
 *
 * - `id_escuela` llega **ya validado** por Zod en el Servicio: o es un entero positivo
 *   o es `undefined`, en cuyo caso se busca con `LIKE '%'` (todas las escuelas).
 * - No se selecciona `contrasena`: el hash nunca debe salir por la API.
 * - Usa el hook genérico `listarEntidad`, por lo que la SQL trae
 *   `COUNT(*) OVER() AS total_registros` para el cálculo de paginación.
 *
 * @param parametros - Un único objeto: lo validado por Zod (`rol`, `id_escuela`, `limit`,
 *   `pagina`) más el `offset` calculado en el Servicio.
 * @returns {Promise<TipadoData<FilaUsuarioAdmin[]>>} Listado paginado o el error asociado.
 */
const listarPorRol = async (
  parametros: ListadoPorRol
): Promise<TipadoData<FilaUsuarioAdmin[]>> => {

  const { rol, id_escuela, limit, pagina, offset } = parametros;

  // La etiqueta fija los códigos del hook: 'alumno' → ALUMNOS_LISTED / NO_ACTIVE_ALUMNOS.
  const entidad = rol === "alumno" ? "Alumnos" : "Usuarios";

  // Sin parámetro → '%' (todas las escuelas). Con parámetro → coincidencia exacta.
  const filtroEscuela = id_escuela === undefined ? "%" : String(id_escuela);

  const sql: string = `SELECT
                          u.id_usuario,
                          u.usuario,
                          u.nombre,
                          u.apellido,
                          u.celular,
                          u.correo,
                          u.rol,
                          u.estado,
                          u.fecha_alta,
                          u.id_escuela,
                          COUNT(*) OVER() AS total_registros
                      FROM usuarios u
                      WHERE u.rol = ?
                        AND u.id_escuela LIKE ?
                      ORDER BY u.usuario
                      LIMIT ${limit} OFFSET ${offset};`;

  const valores: unknown[] = [rol, filtroEscuela];

  return listarEntidad<FilaUsuarioAdmin>({
    slqListado: sql,
    valores: valores,
    entidad: entidad,
    estado: `rol ${rol}`,
    limit: limit,
    pagina: String(pagina),
  });
};

/**
 * Verifica si ya existe ese nombre de login en la tabla `usuarios`.
 *
 * La búsqueda es **global** (sin filtro de escuela) porque así busca el login:
 * `WHERE u.usuario = ?` en `login.data.ts`. Si el nombre ya está ocupado, el alta
 * se corta antes de insertar y responde 409 `USUARIO_YA_REGISTRADO`.
 *
 * @param usuario - Nombre de usuario que manda el frontend en el body.
 * @returns {Promise<TipadoData<{ id_usuario: number; usuario: string }>>}
 *   `USUARIO_EXISTE` si ya hay una fila / `USUARIO_NO_EXISTE` si el nombre está libre.
 */
const buscarUsuario = async (
  usuario: string
): Promise<TipadoData<{ id_usuario: number; usuario: string }>> => {

  const sql: string = `SELECT id_usuario, usuario FROM usuarios WHERE usuario = ?;`;
  const valores: unknown[] = [usuario];

  return await buscarExistenteEntidad({
    slqEntidad: sql,
    valores: valores,
    entidad: "USUARIO"
  });
};

/**
 * Busca un usuario por su `id_usuario` y devuelve el `rol` que tiene hoy.
 *
 * Se usa en la modificación y en la baja lógica ANTES de tocar nada: si no hay
 * fila responde `USUARIO_NO_EXISTE` (el Servicio lo traduce a 404) y el `rol`
 * y el `estado` que trae deciden si corresponde validar el correo o aplicar las
 * reglas de la baja (ver `Servicio.actualizar` / `Servicio.eliminar`).
 *
 * @param id_usuario - Identificador que manda el frontend en el body del PUT / DELETE.
 * @returns {Promise<TipadoData<{ id_usuario: number; usuario: string; rol: string; estado: string }>>}
 *   `USUARIO_EXISTE` con la fila / `USUARIO_NO_EXISTE` si ese id no existe.
 */
const buscarPorId = async (
  id_usuario: number
): Promise<TipadoData<{ id_usuario: number; usuario: string; rol: string; estado: string }>> => {

  const sql: string = `SELECT id_usuario, usuario, rol, estado FROM usuarios WHERE id_usuario = ?;`;
  const valores: unknown[] = [id_usuario];

  return await buscarExistenteEntidad({
    slqEntidad: sql,
    valores: valores,
    entidad: "USUARIO"
  });
};

/**
 * Busca si ese correo ya lo está usando OTRO usuario de la tabla `usuarios`.
 *
 * La comparación es **global** (igual que el login y que el chequeo de
 * `data/alumno.data.ts`) y siempre excluye el `id_usuario` que se está
 * modificando, así un alumno puede conservar su propio correo.
 * Solo se consulta para alumnos: en ellos el correo es también el login.
 *
 * @param correo - Correo nuevo que manda el frontend.
 * @param id_usuario - Usuario que se está modificando (queda fuera de la búsqueda).
 * @returns {Promise<TipadoData<{ id_usuario: number }>>}
 *   `USUARIO_EXISTE` si otro usuario ya usa ese correo / `USUARIO_NO_EXISTE` si está libre.
 */
const buscarPorCorreo = async (
  correo: string,
  id_usuario: number
): Promise<TipadoData<{ id_usuario: number }>> => {

  const sql: string = `SELECT id_usuario FROM usuarios WHERE correo = ? AND id_usuario <> ?;`;
  const valores: unknown[] = [correo, id_usuario];

  return await buscarExistenteEntidad({
    slqEntidad: sql,
    valores: valores,
    entidad: "USUARIO"
  });
};

/**
 * Busca si queda ALGÚN OTRO administrador **activo** además del `id_usuario` indicado.
 *
 * Respalda la regla "no se puede inactivar al último administrador": si este
 * select no trae filas (`USUARIO_NO_EXISTE`), el objetivo sería el último admin
 * activo de la plataforma y el Servicio corta con 409. Se consulta solo cuando
 * `estado === 'inactivos'` y el objetivo es `rol === 'administrador'`.
 *
 * @param id_usuario - Administrador que se quiere inactivar (queda fuera de la búsqueda).
 * @returns {Promise<TipadoData<{ id_usuario: number }>>}
 *   `USUARIO_EXISTE` si queda al menos otro admin activo / `USUARIO_NO_EXISTE` si es el último.
 */
const buscarOtroAdminActivo = async (
  id_usuario: number
): Promise<TipadoData<{ id_usuario: number }>> => {

  const sql: string = `SELECT id_usuario FROM usuarios
                       WHERE rol = 'administrador'
                         AND estado = 'activos'
                         AND id_usuario <> ?;`;
  const valores: unknown[] = [id_usuario];

  return await buscarExistenteEntidad({
    slqEntidad: sql,
    valores: valores,
    entidad: "USUARIO"
  });
};

/**
 * Da de alta un usuario en la tabla `usuarios` con la contraseña **hasheada**.
 *
 * - El reto del alta: `contrasena` llega en texto plano desde el body y NUNCA se
 *   guarda así. `bcrypt.hash(contrasena, 10)` produce el hash **antes** del `INSERT`
 *   (mismo criterio que `data/usuario.data.ts` y `data/alumno.data.ts`).
 * - `estado` y `fecha_alta` NO viajan en la SQL: los pone la BD con sus DEFAULT
 *   (`'activos'` y `curdate()`).
 * - El hash tampoco sale por la API: `datosRetorno` solo lleva lo visible.
 *
 * @param data - Datos ya validados por Zod en el Servicio (`InputCrearUsuarioAdmin`).
 * @returns {Promise<TipadoData<DataCrearResultUsuarioAdmin>>} Alta creada o el error asociado.
 */
const crear = async (data: InputCrearUsuarioAdmin): Promise<TipadoData<DataCrearResultUsuarioAdmin>> => {

  const { usuario, contrasena, nombre, apellido, celular, correo, rol, id_escuela } = data;

  // La contraseña se encripta AQUÍ, antes de tocar la base de datos
  const hashedPassword = await bcrypt.hash(contrasena, 10);

  const sql: string = `INSERT INTO usuarios (usuario, contrasena, nombre, apellido, celular, rol, correo, id_escuela)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;

  const valores: unknown[] = [
    usuario,
    hashedPassword,   // hash bcrypt, jamás el texto plano
    nombre,
    apellido,
    celular ?? null,
    rol,
    correo,
    id_escuela
  ];

  return await iudEntidad({
    slqEntidad: sql,
    valores: valores,
    entidad: "Usuarios",
    metodo: "CREAR",
    datosRetorno: { usuario, correo }
  });
};

/**
 * Modifica un usuario de la tabla `usuarios`.
 *
 * - **SET dinámico**: solo entran en la SQL los campos que mandó el frontend;
 *   `rol`, `estado`, `id_escuela` y `fecha_alta` nunca viajan, así que no se tocan.
 * - Si viene `contrasena`, se hashea con `bcrypt.hash(…, 10)` ANTES del UPDATE
 *   (mismo criterio que el alta): en la BD jamás queda el texto plano.
 * - El `WHERE` es **solo por `id_usuario`** (decisión del usuario).
 * - `datosRetorno` nunca incluye la contraseña.
 *
 * @param data - Datos ya validados por Zod en el Servicio (`InputActualizarUsuarioAdmin`).
 * @returns {Promise<TipadoData<DataActualizarResultUsuarioAdmin>>} Modificación o el error asociado
 *   (`MODIFICAR_NOT_FOUND` → 404 si el id no existe o no cambió ningún valor).
 */
const actualizar = async (data: InputActualizarUsuarioAdmin): Promise<TipadoData<DataActualizarResultUsuarioAdmin>> => {

  const { id_usuario, usuario, contrasena, nombre, apellido, celular, correo } = data;

  const campos: string[] = [];
  const valores: unknown[] = [];

  if ( usuario !== undefined ){ campos.push("usuario = ?"); valores.push(usuario); }
  if ( contrasena !== undefined ){ campos.push("contrasena = ?"); valores.push( await bcrypt.hash(contrasena, 10) ); }
  if ( nombre !== undefined ){ campos.push("nombre = ?"); valores.push(nombre); }
  if ( apellido !== undefined ){ campos.push("apellido = ?"); valores.push(apellido); }
  if ( celular !== undefined ){ campos.push("celular = ?"); valores.push(celular); }
  if ( correo !== undefined ){ campos.push("correo = ?"); valores.push(correo); }

  const sql: string = `UPDATE usuarios
                       SET ${campos.join(", ")}
                       WHERE id_usuario = ?;`;

  valores.push(id_usuario);

  return await iudEntidad({
    slqEntidad: sql,
    valores: valores,
    entidad: "Usuarios",
    metodo: "MODIFICAR",
    datosRetorno: { id_usuario, usuario }
  });
};

/**
 * Cambia el `estado` de un usuario: **baja lógica o reactivación** (la fila
 * nunca se borra, solo pasa de `'activos'` a `'inactivos'` o al revés).
 *
 * - El `WHERE` es **solo por `id_usuario`** (mismo criterio que el PUT).
 * - `rol`, `id_escuela` y `fecha_alta` no viajan: no se tocan.
 * - Los chequeos de negocio (no bajar a uno mismo, no inactivar al último
 *   administrador) vive en el Servicio, ANTES de llegar acá.
 * - El hook responde `USUARIOS_MODIFICAR` y devuelve `{ id_usuario, estado }`.
 *
 * @param data - Datos ya validados por Zod en el Servicio (`InputEliminarUsuarioAdmin`).
 * @returns {Promise<TipadoData<DataEliminarResultUsuarioAdmin>>} Estado aplicado o el
 *   error asociado (`MODIFICAR_NOT_FOUND` → 404 si el id no existe).
 */
const actualizarEstado = async (
  data: InputEliminarUsuarioAdmin
): Promise<TipadoData<DataEliminarResultUsuarioAdmin>> => {

  const { id_usuario, estado } = data;

  const sql: string = `UPDATE usuarios
                       SET estado = ?
                       WHERE id_usuario = ?;`;

  const valores: unknown[] = [estado, id_usuario];

  return await iudEntidad({
    slqEntidad: sql,
    valores: valores,
    entidad: "Usuarios",
    metodo: "MODIFICAR",
    datosRetorno: { id_usuario, estado }
  });
};

export const method = {
  listarPorRol: tryCatchDatos(listarPorRol),
  buscarUsuario: tryCatchDatos(buscarUsuario),
  buscarPorId: tryCatchDatos(buscarPorId),
  buscarPorCorreo: tryCatchDatos(buscarPorCorreo),
  buscarOtroAdminActivo: tryCatchDatos(buscarOtroAdminActivo),
  crear: tryCatchDatos(crear),
  actualizar: tryCatchDatos(actualizar),
  actualizarEstado: tryCatchDatos(actualizarEstado),
};
