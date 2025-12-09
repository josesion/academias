
// Seccion de Hooks
import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidad } from "../hooks/funcionListar";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

//Seccion Typados
import { TipadoData } from "../tipados/tipado.data";
import { PlanesPagoInputs , 
         PlanesEscuelasInputs, 
         ModPlanesUsuariosInputs,
         ListaPlanesUsuariosInputs, ListaPlanesUsuarioSinPagInputs
        } from "../squemas/planes.usuarios";

import { CrearPlanesUsuarios, CrearPlanesEscuelasUsuarios,
         ResultBusquedaPlanes, ModPlanesUsuariosResult, 
         estadoPlanesUsuarios, ResulListadoPlanesUsuarios
        } from "../tipados/planes.usuarios"  ;


/**
 * Verifica si existe un plan por su descripción.
 *
 * Ejecuta una consulta para comprobar si un plan con la descripción proporcionada
 * ya existe en la tabla `planes_pago`.
 *
 * @async
 * @function existenciaPlan
 * @param {string} descripcion - Descripción del plan a verificar.
 * @returns {Promise<TipadoData<ResultBusquedaPlanes>>} Resultado de la búsqueda del plan.
 */



const existenciaPlan = async( descripcion : string ) =>{
    const sql   = ` select 
                            planes_pago.id_plan  
                    from 
                            planes_pago 
                    where 
	                        planes_pago.descripcion_plan = ? ;`;
    const valor = [descripcion];
   
    return await buscarExistenteEntidad<ResultBusquedaPlanes>({
        slqEntidad : sql ,
        valores    : valor,
        entidad    : "Plan",
    });
   
}

/**
 * Verifica si un plan ya está asignado a una escuela específica.
 *
 * Consulta la tabla `planes_en_escuela` para validar si la relación entre
 * un plan y una escuela ya existe.
 *
 * @async
 * @function existenciaPlanEscuela
 * @param {number} id_escuela - ID de la escuela.
 * @param {number} id_plan - ID del plan.
 * @returns {Promise<TipadoData<ResultBusquedaPlanes>>} Resultado de la búsqueda.
 */

const existenciaPlanEscuela = async( id_escuela : number , id_plan : number ) 
 : Promise<TipadoData<ResultBusquedaPlanes>>=>{
    const sql : string  =`select 	id_plan as plan,
		                  id_escuela as escuela	
                from 
		                 planes_en_escuela
                where
		                 planes_en_escuela.id_escuela = ? 
                and
                         planes_en_escuela.id_plan  = ? ;`;

    const valor : unknown[]= [id_escuela , id_plan];

    return await buscarExistenteEntidad({
        slqEntidad : sql ,
        valores    : valor,
        entidad    : "PlanEscuela",
    });

}


/**
 * Crea un nuevo plan general en el sistema.
 *
 * Inserta un registro en la tabla `planes_pago` con la información
 * proporcionada (descripción, clases, meses, monto, estado).
 *
 * @async
 * @function altaPlanes_usuariosData
 * @param {PlanesPagoInputs} planes - Datos del nuevo plan.
 * @returns {Promise<TipadoData<CrearPlanesUsuarios>>} Resultado de la creación.
 */

const altaPlanes_usuariosData = async( planes : PlanesPagoInputs) 
 : Promise<TipadoData<CrearPlanesUsuarios>> =>{
    const {descripcion , cantidad_clases ,cantidad_meses , estado , monto} = planes ;
    const sql: string  = `INSERT INTO planes_pago (descripcion_plan, cantidad_clases, cantidad_meses, monto, estado) VALUES
                ( ? , ? , ? , ? , ? )` ;
    const valores : unknown[]  = [descripcion, cantidad_clases , cantidad_meses, monto , estado];  

    const datosADevolver  = { descripcion , cantidad_clases , cantidad_meses, monto };
    
    return await iudEntidad<CrearPlanesUsuarios>({
        slqEntidad : sql ,
        valores    : valores,
        entidad    :"Planes",
        metodo     : "CREAR",
        datosRetorno : datosADevolver
    })
};

/**
 * Asigna un plan existente a una escuela.
 *
 * Inserta un nuevo registro en la tabla `planes_en_escuela`
 * con la relación entre escuela y plan, junto con la información personalizada.
 *
 * @async
 * @function altaPlanesEscuelas
 * @param {PlanesEscuelasInputs} planesEscuelas - Datos de la relación plan-escuela.
 * @returns {Promise<TipadoData<CrearPlanesEscuelasUsuarios>>} Resultado de la asignación.
 */

const altaPlanesEscuelas = async( planesEscuelas : PlanesEscuelasInputs) 
: Promise<TipadoData<CrearPlanesEscuelasUsuarios>>=>{
    const { id_escuela , id_plan , estado , fecha_creacion, monto , cantidad_clases, cantidad_meses , descripcion} = planesEscuelas;
    const sql : string = `INSERT INTO planes_en_escuela ( id_escuela,
                                                 id_plan, 
                                                 estado, 
                                                 fecha_creacion,
                                                 nombre_personalizado, 
                                                 monto_asignado,
                                                 clases_asignadas,
                                                 meses_asignados) 
                VALUES
                ( ? , ? , ? , ? , ? , ? , ? , ? )` ;
    const valores = [id_escuela , id_plan , estado , fecha_creacion,descripcion ,monto , cantidad_clases, cantidad_meses];

    const datosADevolver    = { id_escuela , id_plan , fecha_creacion, descripcion ,cantidad_clases, cantidad_meses, monto }; 

    return  await iudEntidad<CrearPlanesEscuelasUsuarios>({
        slqEntidad : sql ,
        valores    : valores,
        entidad    : "PlanEscuela",
        metodo     : "CREAR",
        datosRetorno : datosADevolver
    });

};

/**
 * Modifica los datos de un plan asignado a una escuela.
 *
 * Actualiza los valores de un plan en la tabla `planes_en_escuela`,
 * incluyendo nombre personalizado, monto, clases, meses y fecha de creación.
 *
 * @async
 * @function modPlanesUsuarios
 * @param {ModPlanesUsuariosInputs} parametros - Datos del plan a modificar.
 * @returns {Promise<TipadoData<ModPlanesUsuariosResult>>} Resultado de la modificación.
 */

const modPlanesUsuarios = async( parametros :  ModPlanesUsuariosInputs )
 : Promise<TipadoData<ModPlanesUsuariosResult>> =>{
    const { id_escuela, id_plan , nombre_personalizado, monto , cantidad_clases, cantidad_meses , fecha_creacion } = parametros ;

    const sql  : string = ` UPDATE planes_en_escuela
                            SET
	                            nombre_personalizado = ? ,
	                            monto_asignado      = ? ,      
	                            clases_asignadas    = ? ,      
	                            meses_asignados     = ? ,       
                                fecha_creacion      = ?      
                            WHERE
	                            planes_en_escuela.id_escuela  =   ?    
                                and
	                            planes_en_escuela.id_plan     =  ? ;  `;
    const valores : unknown[] = [ nombre_personalizado , monto ,cantidad_clases , cantidad_meses , fecha_creacion, id_escuela, id_plan ];

    const datosADevolver    = { id_escuela , id_plan , fecha_creacion, nombre_personalizado }; 

    return await iudEntidad<ModPlanesUsuariosResult>({
        slqEntidad : sql ,
        valores    : valores,
        entidad    : "PlanUsuario",
        metodo     : "MODIFICAR",
        datosRetorno : datosADevolver
    })
    
};

/**
 * Cambia el estado (activo/inactivo) de un plan asignado a una escuela.
 *
 * Si el plan está activo, lo desactiva; si está inactivo, lo activa.
 *
 * @async
 * @function estadoPlanes_usuarios
 * @param {estadoPlanesUsuarios} parametros - Estado y IDs del plan y escuela.
 * @returns {Promise<TipadoData<estadoPlanesUsuarios>>} Resultado de la actualización.
 */

const estadoPlanes_usuarios = async( parametros : estadoPlanesUsuarios )
: Promise<TipadoData<estadoPlanesUsuarios>> =>{
    const { estado , id_escuela, id_plan } = parametros ;
    const accion : "ALTA" | "ELIMINAR"  = estado === 'activos' ? 'ELIMINAR' : 'ALTA' ;
    const sql : string = `UPDATE planes_en_escuela
                            SET
	                            estado  = ?
                            WHERE
	                            planes_en_escuela.id_escuela  = ?    
                            and
	                            planes_en_escuela.id_plan     = ? ; `;
    const valores : unknown[] = [estado , id_escuela, id_plan ];
    const datosADevolver    = { id_escuela , id_plan , estado };

    return await iudEntidad<estadoPlanesUsuarios>({
        slqEntidad : sql ,
        valores    : valores,
        entidad    : "PlanUsuario",
        metodo     : accion,
        datosRetorno : datosADevolver
    });
};

/**
 * Lista los planes asignados a una escuela, aplicando filtros y paginación.
 *
 * Devuelve los planes que coincidan con la descripción, estado e ID de escuela.
 *
 * @async
 * @function listadoPlanesUsuarios
 * @param {ListaPlanesUsuariosInputs} parametros - Filtros de búsqueda y paginación.
 * @param {string} pagina - Número de página actual.
 * @returns {Promise<TipadoData<ResulListadoPlanesUsuarios[]>>} Listado paginado de planes.
 */

const listadoPlanesUsuarios = async( parametros : ListaPlanesUsuariosInputs,pagina : string ) 
: Promise<TipadoData<ResulListadoPlanesUsuarios[]>> =>{
    const { descripcion , estado , limite , offset , id_escuela } = parametros ;
    const nombreFiltro = `%${descripcion}%`;
// nombrar uno por uno los campos  para q estos se  muestren segun el filtro en el forntend
    const sql : string =    `SELECT 
                           	        id_plan as id,
                                    nombre_personalizado as descripcion,
                                    clases_asignadas as clases,
                                    meses_asignados as meses ,
                                    monto_asignado as monto ,
                                    count(*) over() as total_registros
                            FROM
                                    planes_en_escuela
                            WHERE
                                    nombre_personalizado LIKE ?
                            and 
                                    estado = ? 
                            and 
		                            id_escuela = ?        
                            order by 
	                                nombre_personalizado
                            limit  ${limite}
                            offset ${offset};`;
    const valores : unknown[] = [ nombreFiltro , estado , id_escuela ];

    return await listarEntidad<ResulListadoPlanesUsuarios>({
        slqListado  : sql,
        limit       : limite,
        pagina      : pagina,
        valores     : valores,
        entidad     : "PlanUsuario",
        estado      : estado
    });
                          
};


/**
 * Obtiene un listado de planes sin paginación según los filtros enviados.
 *
 * @async
 * @function listadoPlanesSinPag
 * 
 * @param {ListaPlanesUsuarioSinPagInputs} parametros
 *  Objeto que contiene los parámetros de filtrado:
 *  - descripcion {string} Texto para filtrar por nombre_personalizado (usado con LIKE).
 *  - estado {string} Estado del plan (ej: 'activos').
 *  - id_escuela {number} Identificador de la escuela.
 *
 * @returns {Promise<TipadoData<ResulListadoPlanesUsuarios[]>>}
 *  Retorna una promesa que resuelve un objeto TipadoData con un arreglo de resultados
 *  que representan los planes encontrados.
 *
 * @description
 * La función ejecuta un SELECT contra la tabla `planes_en_escuela`, aplicando los filtros de:
 * - nombre_personalizado (LIKE ?)
 * - estado
 * - id_escuela
 * 
 * Luego ordena los resultados por `nombre_personalizado`.  
 * La ejecución final del SQL se delega a `listarEntidadSinPaginacion`.
 *
 * @example
 * const resultado = await listadoPlanesSinPag({
 *   descripcion: 'Plan%',
 *   estado: 'activos',
 *   id_escuela: 107
 * });
 * 
 * if (!resultado.error) {
 *   console.log(resultado.data); // Array de planes
 * }
 */

const listadoPlanesSinPag = async ( parametros : ListaPlanesUsuarioSinPagInputs)
: Promise<TipadoData<ResulListadoPlanesUsuarios[]>> =>{

    const {descripcion , estado , id_escuela} = parametros;
        const nombreFiltro = `%${descripcion}%`;
    const sql : string =`SELECT 
                           	        id_plan as id,
                                    nombre_personalizado as descripcion,
                                    clases_asignadas as clases,
                                    meses_asignados as meses ,
                                    monto_asignado as monto 
                            FROM
                                    planes_en_escuela
                            WHERE
                                    nombre_personalizado LIKE ?
                            and 
                                    estado = ? 
                            and 
		                            id_escuela = ?        
                            order by 
	                                nombre_personalizado
                            limit 15`;
    const valores : unknown[] = [nombreFiltro , estado , id_escuela ];

    return await listarEntidadSinPaginacion<ResulListadoPlanesUsuarios>({
        slqListado : sql,
        valores ,
        entidad : "PlanUsuario",
        estado  : estado
    });

};

export const method = {
    existenciaPlan          : tryCatchDatos( existenciaPlan ),
    existenciaPlanEscuela   : tryCatchDatos( existenciaPlanEscuela ),
    altaPlanes_usuariosData : tryCatchDatos( altaPlanes_usuariosData ),
    altaPlanesEscuelas      : tryCatchDatos( altaPlanesEscuelas, "Plan", "masculino" ),
    modPlanesUsuarios       : tryCatchDatos( modPlanesUsuarios ),
    estadoPlanes_usuarios   : tryCatchDatos( estadoPlanes_usuarios ),
    listadoPlanesUsuarios   : tryCatchDatos( listadoPlanesUsuarios ),
    listadoPlanesSinPag     : tryCatchDatos( listadoPlanesSinPag )
} 

