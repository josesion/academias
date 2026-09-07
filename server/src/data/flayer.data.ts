import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";

import { TipadoData } from "../tipados/tipado.data";
import { GuardarFlayerInputs } from "../squemas/flayer";


export interface ReturnPostFlayer {
    id? : number,
    titulo : string,
    descripcion : string ,
    imagen_url : string,
    public_id  : string,
};

/**
 * Inserta un nuevo flayer en la base de datos con su respectiva información e imagen.
 * 
 * @async
 * @function postFlayer
 * @param {GuardarFlayerInputs} data - Objeto que contiene los datos necesarios para registrar el flayer.
 * @param {number} data.id_escuela - Identificador de la escuela a la que pertenece el flayer.
 * @param {string} data.titulo - Título del flayer.
 * @param {string} data.descripcion - Descripción detallada del flayer.
 * @param {string} data.imagen_url - URL de acceso a la imagen almacenada.
 * @param {string} data.public_id - Identificador público del recurso en el servicio de almacenamiento de imágenes.
 * @returns {Promise<TipadoData<ReturnPostFlayer>>} Una promesa que resuelve con un objeto de tipo `TipadoData` que contiene la respuesta de la operación y los datos devueltos.
 * @throws {Error} Puede arrojar un error si la consulta de inserción SQL falla.
 * 
 * @example
 * const nuevoFlayer = {
 *   id_escuela: 1,
 *   titulo: "Muestra Anual",
 *   descripcion: "Gran cierre de año",
 *   imagen_url: "https://...",
 *   public_id: "img_123"
 * };
 * const resultado = await postFlayer(nuevoFlayer);
 */
const postFlayer = async(  data : GuardarFlayerInputs)
:Promise<TipadoData<ReturnPostFlayer>> =>{
    const {  id_escuela, titulo, descripcion, imagen_url, public_id } = data;

    const sql : string = `INSERT INTO
                                flyers (
                                    id_escuela,
                                    titulo,
                                    descripcion,
                                    imagen_url,
                                    public_id,
                                    fecha_creacion,
                                    fecha_actualizacion
                                )
                            VALUES (
                                    ?,
                                    ?,
                                    ?,
                                    ?,
                                    ?,
                                    CURRENT_TIMESTAMP,
                                    NULL
                                );`;

    const valores : unknown[] = [id_escuela, titulo, descripcion, imagen_url, public_id ];

    const dataDevolver = { titulo, descripcion, imagen_url, public_id }

    return await iudEntidad<ReturnPostFlayer>({
        slqEntidad : sql,
        valores : valores,
        entidad : "POST_FLAYER",
        metodo :"CREAR",
        datosRetorno : dataDevolver
    });

};


export interface FlayerDataResult {
    id_flayer: number;
    id_escuela: number;
    titulo: string;
    descripcion: string;
    imagen_url: string;
}
/**
 * Obtiene el listado completo de todos los flayers registrados en la base de datos sin paginación.
 * 
 * @async
 * @function getFlayers
 * @returns {Promise<TipadoData<FlayerDataResult[]>>} Una promesa que resuelve con un objeto de tipo `TipadoData` que contiene un arreglo con los datos de cada flayer.
 * @throws {Error} Puede arrojar un error si la consulta a la base de datos falla.
 * 
 * @example
 * const resultado = await getFlayers();
 * console.log(resultado.data);
 */
const getFlayers = async () 
:Promise<TipadoData<FlayerDataResult[]>> =>{
  
    const slq : string = `SELECT
                                id_flayer,
                                id_escuela,
                                titulo,
                                descripcion,
                                imagen_url
                            FROM flyers;`;

    const valores : unknown[] = [];

    return  listarEntidadSinPaginacion({
        slqListado : slq,
        valores : valores,
        entidad : "GET_FLAYERS",
        estado : ""
    });
};



/**
 * Verifica la cantidad de flayers registrados para una escuela específica.
 * 
 * @async
 * @function verificarPlanFlayers
 * @param {number} id_escuela - El identificador único de la escuela cuyos flayers se desean contar.
 * @returns {Promise<TipadoData<{ cantidad_flayers: number }>>} Una promesa que resuelve con un objeto de tipo `TipadoData` que contiene la cantidad total de flayers encontrados.
 * @throws {Error} Puede arrojar un error si la consulta SQL falla o si hay problemas de conexión con la base de datos.
 * 
 * @example
 * const resultado = await verificarPlanFlayers(1);
 * console.log(resultado.data.cantidad_flayers);
 */
const verificarPlanFlayers =async ( id_escuela : number )
:Promise<TipadoData<{ cantidad_flayers : number}>> =>{

    const slq : string = `SELECT COUNT(*) AS cantidad_flayers
                            FROM flyers
                            WHERE id_escuela = ?;`;

    const valores : unknown[] = [ id_escuela];

    return buscarExistenteEntidad({
        slqEntidad : slq,
        valores : valores,
        entidad : "CONTADOR_FLAYES"
    });
};

const getFlayerEscuela = async ( id_escuela : number ) 
:Promise<TipadoData<FlayerDataResult[]>> =>{
  
    const slq : string = `SELECT 
                                id_flayer,
                                id_escuela,
                                titulo,
                                descripcion,
                                imagen_url
                        FROM flyers 
                        WHERE id_escuela = ?;`;

    const valores : unknown[] = [ id_escuela];

    return  listarEntidadSinPaginacion({
        slqListado : slq,
        valores : valores,
        entidad : "GET_FLAYERS",
        estado : ""
    });
};


export interface Flayer {
  id_flayer: number;
  id_escuela: number;
  imagen_url: string;
  public_id: string;
}

const getUrlFlayer = ( id_flayer : number )
:Promise<TipadoData<Flayer>> =>{

    const sql : string = `SELECT id_flayer, id_escuela, imagen_url, public_id 
                            FROM flyers 
                            WHERE id_flayer = ?;`;
                           
    const valor : unknown[] = [ id_flayer ];  
 
    return buscarExistenteEntidad({
        slqEntidad : sql,
        valores : valor,
        entidad : "URL_FLAYER"
    });    

};

export interface ReturnEliminarFlayer {
    id_flayer: number;
}
const eliminarFlayerDb = async (id_flayer: number): Promise<TipadoData<ReturnEliminarFlayer>> => {
    

    const sql: string = `DELETE FROM flyers WHERE id_flayer = ?;`;

    const valores: unknown[] = [id_flayer];

    const dataDevolver = { id_flayer };

    return await iudEntidad<ReturnEliminarFlayer>({
        slqEntidad: sql,
        valores: valores,
        entidad: "FLAYER",
        metodo: "ELIMINAR",
        datosRetorno: dataDevolver
    });
};

export const method = {

    postFlayer : tryCatchDatos( postFlayer ),
    getFlayers : tryCatchDatos( getFlayers ),
    verificarPlan : tryCatchDatos(verificarPlanFlayers),
    getFlayerEscuela : tryCatchDatos( getFlayerEscuela), 
    getUrlFlayer  : tryCatchDatos( getUrlFlayer ),
    eliminarFlayerDb : tryCatchDatos( eliminarFlayerDb),
 };