// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────

import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidad } from "../hooks/funcionListar";
import { tryCatchDatos } from "../utils/tryCatchBD";
//import { listarEntidad } from "../hooks/funcionListar";

// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { TipadoData  } from "../tipados/tipado.data";
import { ResulListadoTipoUsuarios } from "../tipados/tipo.data";
import {CrearTipoInput, ModTipoInput, EstadoTipoInput, ListadoTipoInput} from "../squemas/tipo.usuarios";


/**
 * @async
 * @function verificarTipo
 * @description Verifica la existencia de un tipo de clase en la tabla 'tipo_clase' que coincida 
 * con el nombre del tipo y un ID de escuela específicos.
 * Utiliza una consulta SQL de selección para buscar la entidad.
 * * @param {string} tipo - El nombre o descripción del tipo de clase a buscar (ej: "Teórica").
 * @param {number} id_escuela - El ID de la escuela a la que pertenece el tipo de clase.
 * @returns {Promise<TipadoData<{tipo: string}>>} Una promesa que resuelve con un objeto de tipado de datos 
 * que contiene la información del tipo de clase si existe, o un código de error si no se encuentra.
 * * @example
 * // La consulta SQL subyacente es:
 * // SELECT tipo FROM tipo_clase WHERE tipo = ? AND id_escuela = ?;
 */
const verificarTipo = async( tipo : string, id_escuela : number)
:Promise<TipadoData<{ tipo : string }>> => {
    const sql : string = `select tipo from tipo_clase
                          where 
	                        tipo = ?  and id_escuela = ? ;`;
    const valores : unknown[] = [ tipo , id_escuela];

    return buscarExistenteEntidad<{ tipo : string}>({
        slqEntidad  : sql,
        valores,
        entidad     : "Tipo"
    });
};


/**
 * @async
 * @function altaTipo
 * @description Inserta un nuevo registro de tipo de clase en la tabla 'tipo_clase' de la base de datos.
 * Esta función es un wrapper para una operación de Inserción (IUD - Insert/Update/Delete).
 * El estado se establece por defecto a 'activos' en la sentencia SQL.
 * * @param {CrearTipoInput} data - Objeto de datos que contiene la información del nuevo tipo de clase a crear. 
 * Se esperan las propiedades 'tipo', 'fecha_creacion' e 'id_escuela'.
 * @returns {Promise<TipadoData<{tipo: string}>>} Una promesa que resuelve con un objeto de tipado de datos 
 * que indica el resultado de la operación. En caso de éxito, retorna el nombre del tipo de clase creado. 
 * El código de la respuesta reflejará si la inserción fue exitosa (ej: "CREAR").
 * * @example
 * const data = { tipo: "Práctica", fecha_creacion: "2025-11-26", id_escuela: 107 };
 * const resultado = await altaTipo(data); 
 * // Retorna: { error: false, code: "CREAR", data: { tipo: "Práctica" }, ...}
 */

const altaTipo = async( data : CrearTipoInput)
: Promise<TipadoData<{tipo : string}>> => {
    const {tipo , fecha_creacion , id_escuela} = data;
    
    const sql : string = `INSERT INTO tipo_clase (tipo, fecha_creacion, estado, id_escuela)
                          VALUES ( ? , ? , 'activos', ? );`;
                          
    const valores : unknown[] = [tipo , fecha_creacion , id_escuela];

    return iudEntidad<{tipo :string}>({
        slqEntidad : sql,
        valores ,
        entidad : "Tipo",
        metodo  : "CREAR",
        datosRetorno : { tipo }
    });

};

/**
 * @async
 * @function modTipo
 * @description Ejecuta la actualización (UPDATE) de un registro de tipo de clase en la tabla 'tipo_clase'.
 * Modifica la descripción del tipo ('tipo') basándose en el ID del registro y el ID de la escuela proporcionados.
 * Esta función es un wrapper para una operación de Modificación (IUD - Insert/Update/Delete).
 * * @param {ModTipoInput} data - Objeto de datos que contiene la información para la modificación. 
 * Se esperan las propiedades 'id' (ID del registro), 'tipo' (nueva descripción) e 'id_escuela'.
 * @returns {Promise<TipadoData<{id: number, tipo: string}>>} Una promesa que resuelve con un objeto de tipado de datos 
 * que indica el resultado de la operación. En caso de éxito, retorna el ID y la nueva descripción del tipo modificado. 
 * El código de la respuesta reflejará si la modificación fue exitosa (ej: "MODIFICAR").
 * * @example
 * const data = { id: 8, tipo: "Seminario", id_escuela: 107 };
 * const resultado = await modTipo(data); 
 * // Retorna: { error: false, code: "MODIFICAR", data: { id: 8, tipo: "Seminario" }, ...}
 */

const modTipo = async( data : ModTipoInput)
: Promise<TipadoData<{id: number , tipo : string}>>=> {
    const { id, tipo , id_escuela} = data ;

    const sql : string =`update tipo_clase
                            set
                                tipo = ?
                            where 
                                id = ? and id_escuela = ?;` ;
    const valores : unknown[] = [tipo , id , id_escuela];

    return iudEntidad({
        slqEntidad : sql,
        valores ,
        entidad : "Tipo",
        metodo  : "MODIFICAR",
        datosRetorno : { id , tipo}
    });
};

/**
 * @async
 * @function estadoTipo
 * @description Ejecuta la actualización (UPDATE) del estado de un registro de tipo de clase en la tabla 'tipo_clase'.
 * Modifica el campo 'estado' basándose en el ID del registro y el ID de la escuela proporcionados.
 * Esta función es un wrapper para una operación de Modificación (IUD - Insert/Update/Delete).
 * * @param {EstadoTipoInput} data - Objeto de datos que contiene la información para el cambio de estado. 
 * Se esperan las propiedades 'id' (ID del tipo), 'estado' (el nuevo estado) e 'id_escuela'.
 * @returns {Promise<TipadoData<{id: number}>>} Una promesa que resuelve con un objeto de tipado de datos 
 * que indica el resultado de la operación. En caso de éxito, retorna el ID del tipo modificado. 
 * El código de la respuesta reflejará si la modificación fue exitosa (ej: "MODIFICAR").
 * * @example
 * const data = { id: 8, estado: "inactivos", id_escuela: 107 };
 * const resultado = await estadoTipo(data); 
 * // Retorna: { error: false, code: "MODIFICAR", data: { id: 8 }, ...}
 */

const estadoTipo = async( data : EstadoTipoInput  )
: Promise<TipadoData<{ id: number }>>=> {
    const { id, estado , id_escuela} = data ;

    const sql : string =`update tipo_clase
                            set
                                estado = ?
                            where 
                                id = ? and id_escuela = ?;` ;
    const valores : unknown[] = [ estado , id , id_escuela];

    return iudEntidad({
        slqEntidad : sql,
        valores ,
        entidad : "Tipo",
        metodo  : "MODIFICAR",
        datosRetorno : { id }
    });
};

/**
 * @async
 * @function listadoTipo
 * @description Ejecuta una consulta SQL paginada a la tabla 'tipo_clase' para obtener un listado de tipos 
 * que coincidan con los filtros de búsqueda proporcionados.
 * Aplica filtros por descripción del tipo (usando LIKE), estado y ID de la escuela.
 * Utiliza cláusulas LIMIT y OFFSET para la paginación a nivel de base de datos, 
 * y la función de ventana COUNT(*) OVER() para obtener el total de registros sin paginar.
 * * @param {ListadoTipoInput} data - Objeto con los parámetros de filtro y paginación validados. 
 * Se desestructuran: 'tipo', 'estado', 'id_escuela', 'limite', y 'offset'.
 * @param {string} pagina - El número de página actual, utilizado por el wrapper 'listarEntidad' para el control de paginación.
 * @returns {Promise<TipadoData<ResulListadoTipoUsuarios[]>>} Una promesa que resuelve con un objeto de tipado de datos 
 * que contiene la lista de tipos de clase, junto con la información de paginación (incluido el total_registros).
 * * @example
 * // La consulta SQL generada para el listado es:
 * // SELECT id, tipo, COUNT(*) OVER() AS total_registros FROM tipo_clase 
 * // WHERE tipo LIKE '%?%' AND estado = ? AND id_escuela = ? 
 * // ORDER BY tipo LIMIT [limite] OFFSET [offset];
 */

const listadoTipo = async( data : ListadoTipoInput, pagina : string)
:Promise<TipadoData<ResulListadoTipoUsuarios[]>> =>{
    const {tipo ,estado , id_escuela ,limite ,offset} = data ;
    const tipoFiltro : string = `%${tipo}%`;

    const sql : string = `select 
                                id, tipo,
                                COUNT(*) OVER() AS total_registros
                            from 
                                tipo_clase
                            where
                                tipo like ? and
                                estado = ?  and
                                id_escuela = ?
                            order by tipo 
                                LIMIT ${limite}
                                OFFSET ${offset};`;

    const valores : unknown[] = [ tipoFiltro, estado , id_escuela ];

    return listarEntidad<{ id : number , tipo : string, total_registros : number }>({
        slqListado : sql,
        limit      : limite,
        pagina,
        valores,
        entidad : "Tipo",
        estado
    });
};

// ──────────────────────────────────────────────────────────────
// Export de métodos con tryCatchDatos
// ──────────────────────────────────────────────────────────────
export const method = {
    verificar : tryCatchDatos( verificarTipo ),
    altaTipo  : tryCatchDatos( altaTipo ),
    modficarTipo  : tryCatchDatos( modTipo ),
    estadoTipo    : tryCatchDatos( estadoTipo ),
    listado       : tryCatchDatos( listadoTipo )
};