import { tryCatchDatos } from "../utils/tryCatchBD";
import { TipadoData } from "../tipados/tipado.data";

export interface DataListadoUsuarioAdmin {
  // TODO: Definir propiedades para el listado
}

export interface DataCrearResultUsuarioAdmin {
  // TODO: Definir propiedades para la creación
}

export interface DataActualizarResultUsuarioAdmin {
  // TODO: Definir propiedades para la actualización
}

export interface DataEliminarResultUsuarioAdmin {
  // TODO: Definir propiedades para la eliminación
}

/**
 * Obtiene el listado de usuarios administradores.
 *
 * @param _data - Parámetros de listado (pendiente de definir).
 * @returns {Promise<TipadoData<DataListadoUsuarioAdmin[]>>} Listado o error de servidor.
 */
const listar = async (_data: unknown): Promise<TipadoData<DataListadoUsuarioAdmin[]>> => {
  // TODO: Implementar lógica SQL de obtención sobre la tabla usuarios
  // (usando los hooks genéricos: listarEntidad / listarEntidadSinPaginacion)
  return {
    error: true,
    message: "Error en el servidor , listar usuario admin.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Crea un nuevo usuario administrador.
 *
 * @param _data - Datos del usuario a crear.
 * @returns {Promise<TipadoData<DataCrearResultUsuarioAdmin>>} Resultado del alta o error de servidor.
 */
const crear = async (_data: unknown): Promise<TipadoData<DataCrearResultUsuarioAdmin>> => {
  // TODO: Implementar lógica SQL de inserción (hook iudEntidad sobre la tabla usuarios)
  return {
    error: true,
    message: "Error en el servidor , crear usuario admin.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Actualiza un usuario administrador existente.
 *
 * @param _data - Datos del usuario a actualizar.
 * @returns {Promise<TipadoData<DataActualizarResultUsuarioAdmin>>} Resultado o error de servidor.
 */
const actualizar = async (_data: unknown): Promise<TipadoData<DataActualizarResultUsuarioAdmin>> => {
  // TODO: Implementar lógica SQL de actualización (hook iudEntidad sobre la tabla usuarios)
  return {
    error: true,
    message: "Error en el servidor , actualizar usuario admin.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Elimina (baja lógica) un usuario administrador.
 *
 * @param _data - Identificación del usuario a eliminar.
 * @returns {Promise<TipadoData<DataEliminarResultUsuarioAdmin>>} Resultado o error de servidor.
 */
const eliminar = async (_data: unknown): Promise<TipadoData<DataEliminarResultUsuarioAdmin>> => {
  // TODO: Implementar lógica SQL de eliminación (hook iudEntidad sobre la tabla usuarios)
  return {
    error: true,
    message: "Error en el servidor , eliminar usuario admin.",
    code: "ERROR_SERVIDOR",
  };
};

export const method = {
  listar: tryCatchDatos(listar),
  crear: tryCatchDatos(crear),
  actualizar: tryCatchDatos(actualizar),
  eliminar: tryCatchDatos(eliminar),
};
