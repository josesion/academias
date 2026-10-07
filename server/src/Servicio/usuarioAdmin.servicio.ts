import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataUsuarioAdmin,
         DataListadoUsuarioAdmin,
         DataCrearResultUsuarioAdmin,
         DataActualizarResultUsuarioAdmin,
         DataEliminarResultUsuarioAdmin
       } from "../data/usuarioAdmin.data";
import { TipadoData } from "../tipados/tipado.data";

import { EsquemaListadoUsuarioAdmin, EsquemaCrearUsuarioAdmin,
         EsquemaActualizarUsuarioAdmin, EsquemaEliminarUsuarioAdmin
       } from "../squemas/usuarioAdmin";

/**
 * Servicio de listado de usuarios administradores.
 *
 * @param data - Parámetros de listado; se validan con `EsquemaListadoUsuarioAdmin`.
 * @returns {Promise<TipadoData<DataListadoUsuarioAdmin[]>>} Listado o el error asociado.
 */
const listar = async (data: unknown): Promise<TipadoData<DataListadoUsuarioAdmin[]>> => {

    const parametros = EsquemaListadoUsuarioAdmin.parse(data);

    const resultado = await dataUsuarioAdmin.listar(parametros);

    // TODO: traducir los códigos de la data a los códigos de MAPA_LISTAR_USUARIO_ADMIN

    if ( resultado.error === false ){
        return {
            error : false,
            message : "Listado de usuarios admin.",
            data : resultado.data,
            code : "LISTADO_USUARIO_ADMIN_OK"
        };
    };

    // Por defecto: si no se cumplió ninguna de las reglas de arriba
    return {
        error : true,
        message : "Error en el servidor , listar usuario admin.",
        code : "ERROR_SERVIDOR"
    };
};

/**
 * Servicio de alta de un usuario administrador.
 *
 * @param data - Datos del usuario; se validan con `EsquemaCrearUsuarioAdmin`.
 * @returns {Promise<TipadoData<DataCrearResultUsuarioAdmin>>} Resultado del alta o el error asociado.
 */
const crear = async (data: unknown): Promise<TipadoData<DataCrearResultUsuarioAdmin>> => {

    const parametros = EsquemaCrearUsuarioAdmin.parse(data);

    const resultado = await dataUsuarioAdmin.crear(parametros);

    // TODO: traducir los códigos de la data a los códigos de MAPA_CREAR_USUARIO_ADMIN

    if ( resultado.error === false ){
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
 * Servicio de modificación de un usuario administrador.
 *
 * @param data - Datos del usuario; se validan con `EsquemaActualizarUsuarioAdmin`.
 * @returns {Promise<TipadoData<DataActualizarResultUsuarioAdmin>>} Resultado o el error asociado.
 */
const actualizar = async (data: unknown): Promise<TipadoData<DataActualizarResultUsuarioAdmin>> => {

    const parametros = EsquemaActualizarUsuarioAdmin.parse(data);

    const resultado = await dataUsuarioAdmin.actualizar(parametros);

    // TODO: traducir los códigos de la data a los códigos de MAPA_ACTUALIZAR_USUARIO_ADMIN

    if ( resultado.error === false ){
        return {
            error : false,
            message : "Usuario admin actualizado.",
            data : resultado.data,
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
 * Servicio de baja de un usuario administrador.
 *
 * @param data - Identificación del usuario; se valida con `EsquemaEliminarUsuarioAdmin`.
 * @returns {Promise<TipadoData<DataEliminarResultUsuarioAdmin>>} Resultado o el error asociado.
 */
const eliminar = async (data: unknown): Promise<TipadoData<DataEliminarResultUsuarioAdmin>> => {

    const parametros = EsquemaEliminarUsuarioAdmin.parse(data);

    const resultado = await dataUsuarioAdmin.eliminar(parametros);

    // TODO: traducir los códigos de la data a los códigos de MAPA_ELIMINAR_USUARIO_ADMIN

    if ( resultado.error === false ){
        return {
            error : false,
            message : "Usuario admin eliminado.",
            data : resultado.data,
            code : "ELIMINAR_USUARIO_ADMIN_OK"
        };
    };

    // Por defecto: si no se cumplió ninguna de las reglas de arriba
    return {
        error : true,
        message : "Error en el servidor , eliminar usuario admin.",
        code : "ERROR_SERVIDOR"
    };
};

export const method = {
  listar: tryCatchDatos(listar),
  crear: tryCatchDatos(crear),
  actualizar: tryCatchDatos(actualizar),
  eliminar: tryCatchDatos(eliminar),
};
