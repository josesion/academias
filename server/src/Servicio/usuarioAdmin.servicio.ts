import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataUsuarioAdmin,
         FilaUsuarioAdmin,
         DataCrearResultUsuarioAdmin,
         DataActualizarResultUsuarioAdmin,
         DataEliminarResultUsuarioAdmin
       } from "../data/usuarioAdmin.data";
import { TipadoData } from "../tipados/tipado.data";

import { EsquemaListadoUsuarioAdmin, EsquemaCrearUsuarioAdmin,
         EsquemaActualizarUsuarioAdmin, EsquemaEliminarUsuarioAdmin,
         ListadoUsuarioAdminQuery, ListadoPorRol, InputCrearUsuarioAdmin
       } from "../squemas/usuarioAdmin";

/**
 * Listado paginado de usuarios con `rol = 'alumno'`, opcionalmente filtrado por escuela.
 *
 * 1. Valida la query con `EsquemaListadoUsuarioAdmin` (Zod vive solo en esta capa) y le
 *    fija el `rol`: ni se lee del body ni de la query. Si el valor es inválido, el
 *    `.parse()` lanza `ZodError` y **la SQL nunca se ejecuta** (responde 400 VALIDATION_ERROR).
 * 2. Calcula el `offset` a partir de `pagina` y `limit`.
 * 3. Consulta la data y traduce sus códigos a los de `MAPA_LISTAR_USUARIO_ADMIN`.
 *
 * @param data - Query de la request (`pagina`, `limit`, `id_escuela`).
 * @returns {Promise<TipadoData<FilaUsuarioAdmin[]>>} Listado o `SIN_ALUMNOS` (404).
 */
const listarAlumnos = async (data: ListadoUsuarioAdminQuery): Promise<TipadoData<FilaUsuarioAdmin[]>> => {

    const base = EsquemaListadoUsuarioAdmin.parse({ ...data, rol: "alumno" });

    const parametros: ListadoPorRol = { ...base, offset: ( base.pagina - 1 ) * base.limit };

    const resultado = await dataUsuarioAdmin.listarPorRol(parametros);

    if ( resultado.code === "ALUMNOS_LISTED" ){
        return {
            error : false,
            message : "Listado de alumnos.",
            data : resultado.data,
            paginacion : resultado.paginacion,
            code : "LISTADO_ALUMNOS_OK"
        };
    };

    if ( resultado.code === "NO_ACTIVE_ALUMNOS" ){
        return {
            error : true,
            message : resultado.message,
            code : "SIN_ALUMNOS"
        };
    };

    // Por defecto: si no se cumplió ninguna de las reglas de arriba
    return {
        error : true,
        message : "Error en el servidor , listar alumnos.",
        code : "ERROR_SERVIDOR"
    };
};

/**
 * Listado paginado de usuarios con `rol = 'usuario'`, opcionalmente filtrado por escuela.
 *
 * 1. Valida la query con `EsquemaListadoUsuarioAdmin` (Zod vive solo en esta capa) y le
 *    fija el `rol`: ni se lee del body ni de la query. Si el valor es inválido, el
 *    `.parse()` lanza `ZodError` y **la SQL nunca se ejecuta** (responde 400 VALIDATION_ERROR).
 * 2. Calcula el `offset` a partir de `pagina` y `limit`.
 * 3. Consulta la data y traduce sus códigos a los de `MAPA_LISTAR_USUARIO_ADMIN`.
 *
 * @param data - Query de la request (`pagina`, `limit`, `id_escuela`).
 * @returns {Promise<TipadoData<FilaUsuarioAdmin[]>>} Listado o `SIN_USUARIOS` (404).
 */
const listarUsuarios = async (data: ListadoUsuarioAdminQuery): Promise<TipadoData<FilaUsuarioAdmin[]>> => {

    const base = EsquemaListadoUsuarioAdmin.parse({ ...data, rol: "usuario" });

    const parametros: ListadoPorRol = { ...base, offset: ( base.pagina - 1 ) * base.limit };

    const resultado = await dataUsuarioAdmin.listarPorRol(parametros);

    if ( resultado.code === "USUARIOS_LISTED" ){
        return {
            error : false,
            message : "Listado de usuarios.",
            data : resultado.data,
            paginacion : resultado.paginacion,
            code : "LISTADO_USUARIOS_OK"
        };
    };

    if ( resultado.code === "NO_ACTIVE_USUARIOS" ){
        return {
            error : true,
            message : resultado.message,
            code : "SIN_USUARIOS"
        };
    };

    // Por defecto: si no se cumplió ninguna de las reglas de arriba
    return {
        error : true,
        message : "Error en el servidor , listar usuarios.",
        code : "ERROR_SERVIDOR"
    };
};

/**
 * Servicio de alta de un usuario (rol `alumno` o `usuario`).
 *
 * 1. Valida el body con `EsquemaCrearUsuarioAdmin` (Zod vive solo en esta capa):
 *    si algo falla lanza `ZodError` y **no se consulta ni inserta nada** (400 VALIDATION_ERROR).
 * 2. Comprueba que el nombre de login no esté ocupado (`USUARIO_EXISTE`) → corta con 409.
 * 3. Si está libre, delega en la data, que hashea la contraseña con bcrypt antes del INSERT.
 *
 * @param data - Datos del usuario: los 8 campos del body (`id_escuela` también, ver `AGENTS.md`).
 * @returns {Promise<TipadoData<DataCrearResultUsuarioAdmin>>} `CREAR_USUARIO_ADMIN_OK`,
 *   `USUARIO_YA_REGISTRADO` (409) o `ERROR_SERVIDOR`.
 */
const crear = async (data: InputCrearUsuarioAdmin): Promise<TipadoData<DataCrearResultUsuarioAdmin>> => {

    const parametros = EsquemaCrearUsuarioAdmin.parse(data);

    // 1. ¿Ese nombre de login ya está tomado?
    const existe = await dataUsuarioAdmin.buscarUsuario(parametros.usuario);

    if ( existe.code === "USUARIO_EXISTE" ){
        return {
            error : true,
            message : "Ese nombre de usuario ya está en uso.",
            code : "USUARIO_YA_REGISTRADO"
        };
    };

    // 2. Alta con la contraseña hasheada (el hash se hace en la data, antes del INSERT)
    const resultado = await dataUsuarioAdmin.crear(parametros);

    if ( resultado.code === "USUARIOS_CREAR" ){
        return {
            error : false,
            message : "Usuario admin creado.",
            data : resultado.data,
            code : "CREAR_USUARIO_ADMIN_OK"
        };
    };

    // Por defecto: si no se cumplió ninguna de las reglas de arriba
    return {
        error : true,
        message : "Error en el servidor , crear usuario admin.",
        code : "ERROR_SERVIDOR"
    };
};

/**
 * Servicio de modificación de un usuario (rol `alumno` o `usuario`).
 *
 * 1. Valida el body con `EsquemaActualizarUsuarioAdmin` (Zod vive solo en esta capa):
 *    si algo falla lanza `ZodError` y **no se consulta ni modifica nada** (400 VALIDATION_ERROR).
 * 2. Comprueba que el `id_usuario` exista: si no, corta con `USUARIO_NO_ENCONTRADO` (404).
 *    Sirve además para conocer el `rol` actual del usuario.
 * 3. Si cambia el login, verifica que no lo use **otro** usuario → `USUARIO_YA_REGISTRADO` (409).
 * 4. Si cambia el correo Y el usuario es `alumno`, verifica que no lo use otro →
 *    `USUARIO_YA_CORREO` (409). En el resto de roles el correo NO se valida (decisión del usuario).
 * 5. Delega en la data: SET dinámico + hash de la contraseña si viene.
 *
 * @param data - Datos del usuario (`req.body` del PUT). El identificador es `id_usuario`.
 * @returns {Promise<TipadoData<DataActualizarResultUsuarioAdmin>>} `ACTUALIZAR_USUARIO_ADMIN_OK`
 *   (200), `USUARIO_NO_ENCONTRADO` (404), `USUARIO_YA_REGISTRADO`/`USUARIO_YA_CORREO` (409)
 *   o `ERROR_SERVIDOR`.
 */
const actualizar = async (data: unknown): Promise<TipadoData<DataActualizarResultUsuarioAdmin>> => {

    const parametros = EsquemaActualizarUsuarioAdmin.parse(data);

    // 1. ¿Existe el usuario a modificar? (de paso, su rol actual)
    const objetivo = await dataUsuarioAdmin.buscarPorId(parametros.id_usuario);

    if ( objetivo.code === "USUARIO_NO_EXISTE" || !objetivo.data ){
        return {
            error : true,
            message : "No existe un usuario con ese id.",
            code : "USUARIO_NO_ENCONTRADO"
        };
    };

    // 2. ¿Ese nuevo nombre de login lo usa otro usuario?
    if ( parametros.usuario !== undefined ){
        const login = await dataUsuarioAdmin.buscarUsuario(parametros.usuario);

        if ( login.code === "USUARIO_EXISTE" && login.data?.id_usuario !== parametros.id_usuario ){
            return {
                error : true,
                message : "Ese nombre de usuario ya está en uso.",
                code : "USUARIO_YA_REGISTRADO"
            };
        };
    };

    // 3. ¿Ese nuevo correo lo usa otro usuario? Solo aplica a alumnos: allí el
    //    correo es también el login (ver data/alumno.data.ts).
    if ( parametros.correo !== undefined && objetivo.data.rol === "alumno" ){
        const correo = await dataUsuarioAdmin.buscarPorCorreo(parametros.correo, parametros.id_usuario);

        if ( correo.code === "USUARIO_EXISTE" ){
            return {
                error : true,
                message : "Ese correo ya está en uso por otro usuario.",
                code : "USUARIO_YA_CORREO"
            };
        };
    };

    // 4. Modificación (el hash de la contraseña lo hace la data, antes del UPDATE)
    const resultado = await dataUsuarioAdmin.actualizar(parametros);

    if ( resultado.code === "USUARIOS_MODIFICAR" ){
        return {
            error : false,
            message : "Usuario admin actualizado.",
            // Siempre devuelve el login: el nuevo si se cambió, el actual si no.
            data : {
                id_usuario : parametros.id_usuario,
                usuario : parametros.usuario ?? objetivo.data.usuario
            },
            code : "ACTUALIZAR_USUARIO_ADMIN_OK"
        };
    };

    // Por defecto: si no se cumplió ninguna de las reglas de arriba
    return {
        error : true,
        message : "Error en el servidor , actualizar usuario admin.",
        code : "ERROR_SERVIDOR"
    };
};

/**
 * Servicio de **baja lógica / reactivación** de una cuenta
 * (`DELETE /api/usuario_admin_baja`).
 *
 * 1. Valida con `EsquemaEliminarUsuarioAdmin` (Zod vive solo en esta capa): si
 *    algo falla lanza `ZodError` y **no se consulta ni modifica nada** (400).
 * 2. Comprueba que el `id_usuario` exista: si no, corta con
 *    `USUARIO_NO_ENCONTRADO` (404). De paso trae el `rol` y el `estado` actuales.
 * 3. Solo cuando se **inactiva** (`estado === 'inactivos'`):
 *    - `id_propio === id_usuario` → `USUARIO_PROPIO_NO_BAJA` (409): nadie se
 *      da de baja a sí mismo (`id_propio` viene del token, no del cliente).
 *    - Si el objetivo es `administrador` activo y **no queda otro** admin
 *      activo → `ULTIMO_ADMINISTRADOR` (409): la plataforma no puede quedar
 *      sin administradores.
 * 4. Delega en la data (UPDATE de `estado`); traduce `USUARIOS_MODIFICAR` a
 *    `USUARIO_ADMIN_ESTADO_OK`. La fila **nunca se borra**.
 *
 * @param data - `req.body` del DELETE (`id_usuario`, `estado`) + `id_propio` del token.
 * @returns {Promise<TipadoData<DataEliminarResultUsuarioAdmin>>} `USUARIO_ADMIN_ESTADO_OK`
 *   (200), `USUARIO_NO_ENCONTRADO` (404), `USUARIO_PROPIO_NO_BAJA` /
 *   `ULTIMO_ADMINISTRADOR` (409) o `ERROR_SERVIDOR`.
 */
const eliminar = async (data: unknown): Promise<TipadoData<DataEliminarResultUsuarioAdmin>> => {

    const parametros = EsquemaEliminarUsuarioAdmin.parse(data);

    // 1. ¿Existe el usuario objetivo? (de paso: rol y estado vigentes)
    const objetivo = await dataUsuarioAdmin.buscarPorId(parametros.id_usuario);

    if ( objetivo.code === "USUARIO_NO_EXISTE" || !objetivo.data ){
        return {
            error : true,
            message : "No existe un usuario con ese id.",
            code : "USUARIO_NO_ENCONTRADO"
        };
    };

    // 2. Reglas de la baja: solo corren al pasar a 'inactivos'
    if ( parametros.estado === "inactivos" ){

        // 2a. Nadie se da de baja a sí mismo (evita quedarse fuera de la cuenta)
        if ( parametros.id_propio === parametros.id_usuario ){
            return {
                error : true,
                message : "No podés dar de baja tu propia cuenta.",
                code : "USUARIO_PROPIO_NO_BAJA"
            };
        };

        // 2b. No inactivar al ÚLTIMO administrador activo. Si el objetivo es un
        //     admin activo y no queda ningún otro, cortamos.
        if ( objetivo.data.rol === "administrador" && objetivo.data.estado === "activos" ){
            const otroAdmin = await dataUsuarioAdmin.buscarOtroAdminActivo(parametros.id_usuario);

            if ( otroAdmin.code === "USUARIO_NO_EXISTE" ){
                return {
                    error : true,
                    message : "No se puede inactivar al último administrador activo.",
                    code : "ULTIMO_ADMINISTRADOR"
                };
            };
        };
    };

    // 3. Aplica el nuevo estado (la fila queda en la BD)
    const resultado = await dataUsuarioAdmin.actualizarEstado(parametros);

    if ( resultado.code === "USUARIOS_MODIFICAR" ){
        return {
            error : false,
            message : parametros.estado === "inactivos"
                            ? "Usuario dado de baja."
                            : "Usuario reactivado.",
            data : resultado.data,
            code : "USUARIO_ADMIN_ESTADO_OK"
        };
    };

    // Por defecto: si no se cumplió ninguna de las reglas de arriba
    return {
        error : true,
        message : "Error en el servidor , cambiar estado de usuario admin.",
        code : "ERROR_SERVIDOR"
    };
};

export const method = {
  listarAlumnos: tryCatchDatos(listarAlumnos),
  listarUsuarios: tryCatchDatos(listarUsuarios),
  crear: tryCatchDatos(crear),
  actualizar: tryCatchDatos(actualizar),
  eliminar: tryCatchDatos(eliminar),
};
