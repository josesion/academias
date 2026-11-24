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
import { SalaData, ModificarSalaData, estadoSala as estado, ResulListadoSalaUsuarios,
    ResulListSinPagSalaUsuarios
} from "../tipados/sala.data"; 
import { EstadoSalaInput, ListadoSalaInput } from "../squemas/salas";

/**
 * @async
 * @function salaExiste
 * @description Verifica la existencia de un registro de sala en la tabla 'salas' que coincida 
 * con un ID de sala y un ID de escuela específicos.
 * @param {number} id - El ID de la sala a buscar.
 * @param {number} id_escuela - El ID de la escuela a la que pertenece la sala.
 * @returns {Promise<TipadoData<{id: number, nombre: string}>>}
 */

const salaExiste  = async ( id: number , id_escuela : number)
: Promise<TipadoData<{id : number , nombre : string}>> => {
    const sql : string = `SELECT id, nombre 
                            FROM salas 
                            WHERE 
                            id_escuela = ?
                            AND id = ?;`;
    const valores : unknown[] = [ id_escuela, id ];
    return buscarExistenteEntidad<{ id: number , nombre: string}>({
        slqEntidad : sql,
        valores,
        entidad   : "Sala"
    });
};

/**
 * @async
 * @function salaNombreExiste
 * @description Verifica si ya existe una sala con el mismo nombre en la escuela.
 * Se usa al crear para evitar duplicados.
 */

const salaNombreExiste = async ( nombre: string , id_escuela : number)
: Promise<TipadoData<{id : number , nombre : string}>> => {
    const sql : string = `SELECT id, nombre 
                            FROM salas 
                            WHERE 
                            id_escuela = ?
                            AND nombre = ?;`;
    const valores : unknown[] = [ id_escuela, nombre ];
    return buscarExistenteEntidad<{ id: number , nombre: string}>({
        slqEntidad : sql,
        valores,
        entidad   : "Sala"
    });
};

/**
 * @async
 * @function salaNombreDuplicadoMod
 * @description Verifica si ya existe otra sala con el mismo nombre, excluyendo la sala actual.
 * Se usa al modificar para detectar duplicados reales.
 */

const salaNombreDuplicadoMod = async ( nombre: string , id_escuela : number , id : number)
: Promise<TipadoData<{id : number , nombre : string}>> => {
    const sql : string = `SELECT id, nombre 
                            FROM salas 
                            WHERE 
                            id_escuela = ?
                            AND nombre = ?
                            AND id != ?;`;
    const valores : unknown[] = [ id_escuela, nombre, id ];
    return buscarExistenteEntidad<{ id: number , nombre: string}>({
        slqEntidad : sql,
        valores,
        entidad   : "Sala"
    });
};

/**
 * @async
 * @function altaSalaGlobal
 * @description Inserta un nuevo registro de sala en la tabla 'salas' de la base de datos.
 * @param {SalaData} data - Objeto de datos que contiene la información de la nueva sala.
 * @returns {Promise<TipadoData<{nombre: string}>>}
 */

const altaSalaGlobal = async ( data : SalaData )
: Promise<TipadoData<{ nombre : string, id?: number }>> => {
    const { nombre , capacidad , fecha_creacion , id_escuela } = data;

    const sql : string = `INSERT INTO salas (nombre, capacidad, fecha_creacion, id_escuela)
                          VALUES  
                            ( ? , ? , ? , ?); `;

    const valores : unknown[] = [ nombre , capacidad , fecha_creacion , id_escuela];
    const datosADevolver = { nombre };

    return iudEntidad<{ nombre : string, id?: number}>({
        slqEntidad : sql,
        valores,
        entidad   : "Sala",
        metodo    : "CREAR",
        datosRetorno : datosADevolver
    })

};

/**
 * @async
 * @function modificarSala
 * @description Ejecuta la actualización (UPDATE) de un registro de sala en la tabla 'salas'.
 * @param {ModificarSalaData} data - Objeto de datos que contiene la información para la modificación.
 * @returns {Promise<TipadoData<{nombre: string}>>}
 */

const modificarSala = async ( data : ModificarSalaData ) 
: Promise<TipadoData<{ nombre : string}>> => {
    const { id , nombre , capacidad , id_escuela } = data;

    const sql : string = `update 
                                salas
                            set 
                                nombre = ?,
                                capacidad = ?
                            where
                                id = ? and id_escuela = ? ;`;
    const valores : unknown[] = [ nombre , capacidad , id , id_escuela ];
    return iudEntidad<{ nombre : string}>({
        slqEntidad : sql,
        valores,
        entidad   : "Sala",
        metodo    : "MODIFICAR",
        datosRetorno : { nombre }
    });
};

/**
 * @async
 * @function estadoSala
 * @description Ejecuta la actualización (UPDATE) del estado de un registro de sala en la tabla 'salas'.
 * @param {estado} data - Objeto de datos que contiene la información necesaria para el cambio de estado.
 * @returns {Promise<TipadoData<{id: number}>>}
 */

const estadoSala = async( data : estado) 
: Promise<TipadoData<{ id : number }>> => {
    const { estado , id , id_escuela} = data;

    const sql : string = `update 
                                salas
                            set 
                                estado = ?
                            where
                                id = ? and id_escuela = ?;`;

    const valores : unknown[] = [estado , id , id_escuela];

    return iudEntidad<{id : number }>({
        slqEntidad : sql ,
        valores ,
        entidad : "Sala",
        metodo  : "MODIFICAR",
        datosRetorno : { id }
    });
};

/**
 * @async
 * @function listadoSalas
 * @description Ejecuta una consulta SQL paginada a la tabla 'salas' para obtener un listado de salas.
 * @param {ListadoSalaInput} parametros - Objeto con los parámetros de filtro y paginación.
 * @param {string} pagina - El número de página actual.
 * @returns {Promise<TipadoData<ResulListadoSalaUsuarios[]>>}
 */

const listadoSalas = async(  parametros : ListadoSalaInput , pagina : string)
: Promise<TipadoData<ResulListadoSalaUsuarios[]>> => {
    const { nombre, estado , id_escuela , limite , offset} = parametros ;
    const nombreFiltro = `%${nombre}%`;

    const sql : string = `select 
                            id,
                            nombre,
                            capacidad,
                            count(*) over() as total_registros
                        from 
                            salas
                        where 
                            nombre like ? and id_escuela = ? and estado = ?
                        order by 
                            nombre
                        limit ${limite}
                        offset ${offset}`;

   const valores : unknown[] = [nombreFiltro , id_escuela , estado];

   return listarEntidad<ResulListadoSalaUsuarios>({
        slqListado : sql,
        valores,
        limit : limite,
        pagina ,
        entidad : "Sala",
        estado : estado
   });
};

/**
 * @async
 * @function listadoSalasSinPag
 * @description Obtiene un listado de salas sin paginación, filtrado por nombre, estado y escuela.
 * @param {ListadoSalaInput} parametros - Objeto con los filtros de búsqueda.
 * @returns {Promise<TipadoData<ResulListSinPagSalaUsuarios[]>>}
 */

const listadoSalasSinPag = async(  parametros : ListadoSalaInput ) 
: Promise<TipadoData<ResulListSinPagSalaUsuarios[]>>=>{
    const { nombre, estado , id_escuela } = parametros ;

    const nombreFiltro = `%${nombre}%`;     

    const sql : string = `select 
                            id,
                            nombre,
                            capacidad  
                        from 
                            salas
                        where 
                            nombre like ? and id_escuela = ? and (? = 'todos' or estado = ?)
                        order by 
                            nombre
                        limit 50 ;`;
    const valores : unknown[] = [nombreFiltro , id_escuela , estado, estado];

    return  listarEntidadSinPaginacion<ResulListSinPagSalaUsuarios>({
        slqListado : sql,
        valores,
        entidad : "Sala",
        estado : estado
    });
};



export const method = {
    salaExiste : tryCatchDatos( salaExiste ),
    salaNombreExiste : tryCatchDatos( salaNombreExiste ),
    salaNombreDuplicadoMod : tryCatchDatos( salaNombreDuplicadoMod ),
    altaSalaGlobal : tryCatchDatos( altaSalaGlobal ),
    modificarSala : tryCatchDatos( modificarSala ),
    cambioEstado  : tryCatchDatos( estadoSala) ,
    listado       : tryCatchDatos( listadoSalas ),
    listadoSalasSinPag : tryCatchDatos( listadoSalasSinPag ),
}
