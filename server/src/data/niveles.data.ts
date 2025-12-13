// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidad } from "../hooks/funcionListar";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { TipadoData } from "../tipados/tipado.data"; 
import { NivelData,ModificarNivelData, estadoNivel as estado , ResulListadoNivelUsuarios,
    ResulListSinPagNivelUsuarios
} from "../tipados/nivel.data"; 
import { ListadoNivelInput } from "../squemas/nivel";

/**
 * @async
 * @function nivelExiste
 * @description Verifica la existencia de un registro de nivel en la tabla 'niveles' que coincida 
 * con un nombre de nivel y un ID de escuela específicos.
 * Utiliza una consulta SQL de selección para buscar la entidad.
 * * @param {string} nivel - El nombre o descripción del nivel a buscar (ej: "Primario").
 * @param {number} id_escuela - El ID de la escuela a la que pertenece el nivel.
 * @returns {Promise<TipadoData<{id: number, nivel: string}>>} Una promesa que resuelve con un objeto de tipado de datos 
 * que contiene la información del nivel si existe, o un código de error si no se encuentra (ej: "NIVEL_NO_EXISTE").
 * * @example
 * // La consulta SQL subyacente es:
 * // SELECT id, nivel FROM niveles WHERE nivel = ? AND id_escuela = ?;
 */

const nivelExiste  = async ( nivel: string  , id_escuela : number)
: Promise<TipadoData<{id : number , nivel : string}>> => {
    const sql : string = `select 
                                id, 
                                nivel 
                          from 
                                niveles
                          where 
                                nivel = ?
                            and
                                id_escuela = ? ;`;
    const valores : unknown[] = [ nivel , id_escuela];
    return buscarExistenteEntidad<{ id: number , nivel: string }>({
        slqEntidad : sql,
        valores,
        entidad   : "Nivel"
    });
};

/**
 * @async
 * @function altaNivelGlobal
 * @description Inserta un nuevo registro de nivel en la tabla 'niveles' de la base de datos.
 * Esta función es un wrapper para una operación de Inserción (IUD - Insert/Update/Delete).
 * * @param {NivelData} data - Objeto de datos que contiene la información del nuevo nivel a crear. 
 * Se esperan las propiedades 'nivel', 'fecha_creacion' y 'id_escuela'.
 * @returns {Promise<TipadoData<{nivel: string}>>} Una promesa que resuelve con un objeto de tipado de datos 
 * que indica el resultado de la operación. En caso de éxito, retorna el nombre del nivel creado. 
 * El código de la respuesta reflejará si la inserción fue exitosa (ej: "NIVEL_CREAR").
 * * @example
 * const data = { nivel: "Secundario", fecha_creacion: "2025-11-26", id_escuela: 101 };
 * const resultado = await altaNivelGlobal(data); 
 * // Retorna: { error: false, code: "NIVEL_CREAR", data: { nivel: "Secundario" }, ...}
 */

const altaNivelGlobal = async ( data : NivelData )
: Promise<TipadoData<{ nivel : string }>> => {
    const { nivel , fecha_creacion , id_escuela } = data;

    const sql : string = `INSERT INTO niveles (nivel, fecha_creacion, id_escuela)
                          VALUES  
                            ( ? , ? , ?); `;

    const valores : unknown[] = [ nivel , fecha_creacion , id_escuela];
    const datosADevolver = { nivel };

    return iudEntidad<{ nivel : string}>({
        slqEntidad : sql,
        valores,
        entidad   : "Nivel",
        metodo    : "CREAR",
        datosRetorno : datosADevolver
    })

};

/**
 * @async
 * @function modificarNivel
 * @description Ejecuta la actualización (UPDATE) de un registro de nivel en la tabla 'niveles'.
 * Modifica la descripción del nivel ('nivel') basándose en el ID del nivel y el ID de la escuela proporcionados.
 * Esta función es un wrapper para una operación de Modificación (IUD - Insert/Update/Delete).
 * * @param {ModificarNivelData} data - Objeto de datos que contiene la información para la modificación. 
 * Se esperan las propiedades 'id' (ID del nivel), 'nivel' (nueva descripción) e 'id_escuela'.
 * @returns {Promise<TipadoData<{nivel: string}>>} Una promesa que resuelve con un objeto de tipado de datos 
 * que indica el resultado de la operación. En caso de éxito, retorna la nueva descripción del nivel modificado. 
 * El código de la respuesta reflejará si la modificación fue exitosa (ej: "NIVEL_MODIFICAR").
 * * @example
 * const data = { id: 5, nivel: "Secundario Superior", id_escuela: 101 };
 * const resultado = await modificarNivel(data); 
 * // Retorna: { error: false, code: "NIVEL_MODIFICAR", data: { nivel: "Secundario Superior" }, ...}
 */

const modificarNivel = async ( data : ModificarNivelData ) 
: Promise<TipadoData<{ nivel : string}>> => {
    const { id , nivel , id_escuela } = data;

    const sql : string = `update 
                                niveles
                            set 
                                nivel = ?
                            where
                                id = ? and id_escuela = ? ;`;
    const valores : unknown[] = [ nivel , id , id_escuela ];
    return iudEntidad<{ nivel : string}>({
        slqEntidad : sql,
        valores,
        entidad   : "Nivel",
        metodo    : "MODIFICAR",
        datosRetorno : { nivel }
    });
};

/**
 * @async
 * @function estadoNivel
 * @description Ejecuta la actualización (UPDATE) del estado de un registro de nivel en la tabla 'niveles'.
 * Modifica el campo 'estado' basándose en el ID del nivel y el ID de la escuela proporcionados.
 * Esta función es un wrapper para una operación de Modificación (IUD - Insert/Update/Delete).
 * * @param {estado} data - Objeto de datos que contiene la información necesaria para el cambio de estado. 
 * Se esperan las propiedades 'estado' (el nuevo estado), 'id' (ID del nivel) e 'id_escuela'.
 * @returns {Promise<TipadoData<{id: number}>>} Una promesa que resuelve con un objeto de tipado de datos 
 * que indica el resultado de la operación. En caso de éxito, retorna el ID del nivel modificado. 
 * El código de la respuesta reflejará si la modificación fue exitosa (ej: "MODIFICAR").
 * * @example
 * const data = { estado: "inactivo", id: 5, id_escuela: 101 };
 * const resultado = await estadoNivel(data); 
 * // Retorna: { error: false, code: "MODIFICAR", data: { id: 5 }, ...}
 */

const estadoNivel = async( data : estado) 
: Promise<TipadoData<{ id : number }>> => {
    const { estado , id , id_escuela} = data;

    const sql : string = `update 
                                niveles
                            set 
                                estado = ?
                            where
                                id = ? and id_escuela = ?;`;

    const valores : unknown[] = [estado , id , id_escuela];

    return iudEntidad<{id : number }>({
        slqEntidad : sql ,
        valores ,
        entidad : "Nivel",
        metodo  : "MODIFICAR",
        datosRetorno : { id }
    });
};

/**
 * @async
 * @function listadoNivel
 * @description Ejecuta una consulta SQL paginada a la tabla 'niveles' para obtener un listado de niveles 
 * que coincidan con los filtros de búsqueda proporcionados.
 * Aplica filtros por descripción del nivel (usando LIKE), estado y ID de la escuela.
 * Utiliza cláusulas LIMIT y OFFSET para implementar la paginación a nivel de base de datos, 
 * y la función de ventana COUNT(*) OVER() para obtener el total de registros sin paginar.
 * * @param {ListadoNivelInput} parametros - Objeto con los parámetros de filtro y paginación. 
 * Se desestructuran: 'nivel', 'estado', 'id_escuela', 'limite', y 'offset'.
 * @param {string} pagina - El número de página actual, utilizado por el wrapper 'listarEntidad' para el control de paginación.
 * @returns {Promise<TipadoData<ResulListadoNivelUsuarios[]>>} Una promesa que resuelve con un objeto de tipado de datos 
 * que contiene la lista de niveles, junto con la información de paginación (incluido el total_registros).
 * * @example
 * // La consulta SQL generada para el listado es:
 * // SELECT id, nivel, count(*) over() as total_registros FROM niveles 
 * // WHERE nivel LIKE '%?%' AND id_escuela = ? AND estado = ? 
 * // ORDER BY nivel LIMIT [limite] OFFSET [offset];
 */

const listadoNivel = async(  parametros : ListadoNivelInput , pagina : string)
: Promise<TipadoData<ResulListadoNivelUsuarios[]>> => {
    const { nivel, estado , id_escuela , limite , offset} = parametros ;
    const nivelFiltro = `%${nivel}%`;

    const sql : string = `select 
                            id,
                            nivel,
                            count(*) over() as total_registros
                        from 
                            niveles
                        where 
                            nivel like ? and id_escuela = ? and estado = ?
                        order by 
                            nivel
                        limit ${limite}
                        offset ${offset}`;

   const valores : unknown[] = [nivelFiltro , id_escuela , estado];

   return listarEntidad<ResulListadoNivelUsuarios>({
        slqListado : sql,
        valores,
        limit : limite,
        pagina ,
        entidad : "Nivel",
        estado : estado
   });
};

/**
 * Obtiene un listado de niveles sin paginación, filtrado por nombre, estado y escuela.
 *
 * Se utiliza principalmente para selects, autocompletados o búsquedas rápidas
 * donde no se requiere paginación completa.
 *
 * - Filtra por coincidencia parcial del nombre del nivel (`LIKE %nivel%`)
 * - Limita el resultado a un máximo de 10 registros
 * - Solo devuelve niveles pertenecientes a una escuela específica
 *
 * @async
 * @function listadoNivelSinPag
 *
 * @param {ListadoNivelInput} parametros
 * Objeto con los filtros de búsqueda.
 *
 * @param {string} parametros.nivel
 * Texto a buscar dentro del nombre del nivel.
 *
 * @param {"activos" | "inactivos" | "todos"} parametros.estado
 * Estado del nivel a filtrar.
 *
 * @param {number} parametros.id_escuela
 * Identificador de la escuela a la que pertenecen los niveles.
 *
 * @returns {Promise<TipadoData<ResulListSinPagNivelUsuarios[]>>}
 * Retorna una promesa con:
 * - `data`: listado de niveles (id y descripción)
 * - `code`: código de estado de la operación
 *
 * @example
 * listadoNivelSinPag({
 *   nivel: "inter",
 *   estado: "activos",
 *   id_escuela: 107
 * });
 */

const listadoNivelSinPag = async(  parametros : ListadoNivelInput ) 
: Promise<TipadoData<ResulListSinPagNivelUsuarios[]>>=>{
    const { nivel, estado , id_escuela } = parametros ;

    const nivelFiltro = `%${nivel}%`;     
    
    const sql : string = `select 
                            id,
                            nivel  
                        from 
                            niveles
                        where 
                            nivel like ? and id_escuela = ? and estado = ?
                        order by 
                            nivel
                        limit 10 ;`;
    const valores : unknown[] = [nivelFiltro , id_escuela , estado];

    return  listarEntidadSinPaginacion<ResulListSinPagNivelUsuarios>({
        slqListado : sql,
        valores,
        entidad : "Nivel",
        estado : estado
    });
};

export const method = {
    nivelExiste : tryCatchDatos( nivelExiste ),
    altaNivelGlobal : tryCatchDatos( altaNivelGlobal ),
    modificarNivel : tryCatchDatos( modificarNivel ),
    cambioEstado  : tryCatchDatos( estadoNivel) ,
    listado       : tryCatchDatos( listadoNivel ),
    listadoNivelSinPag : tryCatchDatos( listadoNivelSinPag )
}