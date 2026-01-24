// ──────────────────────────────────────────────────────────────
// Sección de  hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD"; 
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidad } from "../hooks/funcionListar";
// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { TipadoData } from "../tipados/tipado.data";
import { CategoriaCajaInpurts, ModCategoriaCajaInputs, BajaCategoriCajaInputs, ListadoCategoriaCajaInputs }  from "../squemas/categoria.caja";
import { DataCategoriaCajas, ResultListadoCategoriaCaja } from "../tipados/categoria.caja.tiapado";



/**
 * Verifica si una categoría de caja ya existe en la base de datos para una escuela y tipo de movimiento específicos.
 * * @async
 * @function verificarCategoriaExistente
 * @param {CategoriaCajaInpurts} data - Objeto con los criterios de búsqueda.
 * @param {string} data.nombre_categoria - El nombre de la categoría a validar.
 * @param {number} data.id_escuela - ID de la escuela para limitar el scope de la búsqueda.
 * @param {string} data.tipo_movimiento - El tipo (Ingreso/Egreso) para permitir nombres duplicados en diferentes tipos.
 * * @returns {Promise<Object>} Promesa que resuelve al resultado de `buscarExistenteEntidad`.
 * @property {boolean} existe - Indica si se encontró una coincidencia.
 * @property {string} mensaje - Descripción del resultado para la UI.
 * * @example
 * const existe = await verificarCategoriaExistente({ 
 * nombre_categoria: 'Cuotas', 
 * id_escuela: 1, 
 * tipo_movimiento: 'ingreso' 
 * });
 */
const verificarCategoriaExistente = async(  data : CategoriaCajaInpurts ) => {
    const { nombre_categoria, id_escuela , tipo_movimiento} = data;
    const sql : string =   `select categorias_caja.nombre_categoria 
                            from categorias_caja
                            where nombre_categoria = ? 
                                    and id_escuela = ?
                                    and tipo_movimiento = ?;`;
    const valor : unknown[] = [ nombre_categoria , id_escuela, tipo_movimiento];
    return buscarExistenteEntidad({
      slqEntidad : sql,
      valores : valor,
      entidad : "Categoria_Caja",
    });
};


const altaCategoriaCaja = async( data : CategoriaCajaInpurts )
: Promise<TipadoData<DataCategoriaCajas>> => {
    const  { tipo_movimiento, nombre_categoria , estado, id_escuela } = data;
    const  sql : string = `INSERT INTO categorias_caja (id_escuela, nombre_categoria, tipo_movimiento) 
                            VALUES ( ?, ?, ? );`;
    const  valores : unknown[] = [ id_escuela , nombre_categoria, tipo_movimiento ];
    const datosADevolver = { id_escuela, nombre_categoria, tipo_movimiento, estado};
    return  iudEntidad({
      slqEntidad : sql,
      valores : valores,
      entidad : "Categoria_Caja",
      metodo : "ALTA",
      datosRetorno : datosADevolver
    });
};


/**
 * Ejecuta la actualización de una categoría de caja existente en la base de datos.
 * * @async
 * @function modCategoriaCaja
 * @param {ModCategoriaCajaInputs} data - Objeto con los datos necesarios para la actualización.
 * @param {number} data.id_categoria - Identificador único de la categoría a modificar.
 * @param {string} data.nombre_categoria - Nuevo nombre descriptivo de la categoría.
 * @param {string} data.tipo_movimiento - Nuevo tipo de movimiento (Ingreso/Egreso).
 * @param {number} data.id_escuela - ID de la escuela (utilizado como filtro de seguridad en el WHERE).
 * * @returns {Promise<TipadoData<{id_categoria : number}>>} Promesa que resuelve al estándar de respuesta de la fábrica para operaciones IUD (Insert/Update/Delete).
 * * @example
 * const respuesta = await modCategoriaCaja({
 * id_categoria: 10,
 * nombre_categoria: "Ventas Varias",
 * tipo_movimiento: "ingreso",
 * id_escuela: 1
 * });
 */
const modCategoriaCaja = async( data : ModCategoriaCajaInputs)
: Promise<TipadoData<{id_categoria : number}>> =>{
  const {id_categoria , nombre_categoria , tipo_movimiento, id_escuela} = data;
  const sql : string = `UPDATE categorias_caja 
                        SET 
                            nombre_categoria = ?, 
                            tipo_movimiento  = ? 
                        WHERE id_categoria =  ?
                            and id_escuela = ? ;`;

  const valores : unknown[] = [nombre_categoria, tipo_movimiento, id_categoria, id_escuela];
  
  return iudEntidad({
      slqEntidad : sql,
      valores,
      entidad : "Categoria_Caja",
      metodo : "MODIFICAR",
      datosRetorno : { id_categoria } 
  });

};

/**
 * Realiza la baja lógica (cambio de estado) de una categoría de caja.
 * * @async
 * @function bajaCategoriaCaja
 * @param {BajaCategoriCajaInputs} data - Objeto con las claves de identificación y el nuevo estado.
 * @param {number} data.id_escuela - ID de la escuela para asegurar que la categoría pertenece a la institución.
 * @param {number} data.id_categoria - Identificador único de la categoría a modificar.
 * @param {string} data.estado - El nuevo estado (ej: 'inactivo') que se asignará al registro.
 * * @returns {Promise<TipadoData<BajaCategoriCajaInputs>>} Promesa con el resultado de la operación IUD, retornando los datos actualizados.
 * * @example
 * const respuesta = await bajaCategoriaCaja({
 * id_categoria: 5,
 * id_escuela: 1,
 * estado: 'inactivo'
 * });
 */
const bajaCategoriaCaja = async( data : BajaCategoriCajaInputs) 
: Promise<TipadoData<BajaCategoriCajaInputs>> => {
    const {id_escuela, id_categoria , estado} = data ;
    const sql : string = `UPDATE categorias_caja 
                            SET 
                                estado = ?
                            WHERE id_categoria = ? and id_escuela =  ?;`;
    const valores : unknown[] = [estado, id_categoria, id_escuela]; 

    return iudEntidad({
        slqEntidad: sql,
        valores,
        entidad : "Categoria_Caja",
        metodo  : "ELIMINAR",
        datosRetorno : { id_categoria , id_escuela, estado}
    });
};

/**
 * Obtiene un listado paginado y filtrado de las categorías de caja.
 * * @async
 * @function listadoCategoriaCaja
 * @param {ListadoCategoriaCajaInputs} data - Parámetros de filtrado y paginación.
 * @param {string} data.nombre_categoria - Término de búsqueda para filtrar por nombre (usando LIKE).
 * @param {string} data.estado - Estado de los registros a recuperar (ej: 'activos').
 * @param {number} data.id_escuela - Identificador de la escuela para segmentar los datos.
 * @param {number} data.limit - Cantidad de registros por página.
 * @param {number} data.offset - Desplazamiento calculado para la paginación.
 * @param {string} data.tipo_movimiento - Filtro por tipo (ingreso/egreso) o comodín para todos.
 * @param {number|string} data.pagina - Número de página actual para el retorno de metadatos.
 * * @returns {Promise<TipadoData<ResultListadoCategoriaCaja[]>>} Promesa que resuelve al objeto estandarizado de listado, 
 * incluyendo los datos de las categorías y la información de paginación extraída del Window Function.
 * * @example
 * const categorias = await listadoCategoriaCaja({
 * nombre_categoria: 'cuota',
 * estado: 'activos',
 * id_escuela: 1,
 * limit: 10,
 * offset: 0,
 * tipo_movimiento: 'ingreso',
 * pagina: 1
 * });
 */
const listadoCategoriaCaja = async( data  : ListadoCategoriaCajaInputs)
: Promise<TipadoData<ResultListadoCategoriaCaja[]>> => {
  const { nombre_categoria, estado, id_escuela, limit, offset, tipo_movimiento, pagina } = data ; 
  const nombreCategoriaFiltro =`%${nombre_categoria}%`;
  const sql : string = `select 
                            id_categoria,
                            nombre_categoria,
                            tipo_movimiento,
                            COUNT(*) OVER() AS total_registros
                        from
                            categorias_caja cc
                        where
                            cc.nombre_categoria like ?
                            and cc.estado = ?
                            and cc.id_escuela = ?
                            and cc.tipo_movimiento like ?
                        order by id_categoria
                        limit ${limit}
                        offset ${offset} `;
  const valores : unknown[] = [ nombreCategoriaFiltro, estado, id_escuela, tipo_movimiento  ];    
  
  return await listarEntidad({
    slqListado : sql,
    limit : limit,
    pagina : String(pagina),
    valores,
    entidad : "Categoria_Caja",
    estado
  });
};

export const method = {
    verificarCategoriaExistente : tryCatchDatos(verificarCategoriaExistente),
    altaCategoriaCaja : tryCatchDatos(altaCategoriaCaja),
    modCategoriaCaja  : tryCatchDatos( modCategoriaCaja),
    bajaCategoriaCaja : tryCatchDatos( bajaCategoriaCaja ),
    listadoCategoriaCaja : tryCatchDatos( listadoCategoriaCaja )
};