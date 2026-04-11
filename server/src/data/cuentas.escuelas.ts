
// Hooks seccion 
import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidad } from "../hooks/funcionListar";

// Tipados seccion
import { TipadoData } from "../tipados/tipado.data"; 
import { ResultListadoCuentas } from "../tipados/cuentas.escuelas";
import { CuentaEscuelaInput, ModificarCuentaEscuelaUnputs,
         EstadoCuentasInputs, ListadoCuentasInputs,
 } from "../squemas/cuentas.escuelas";

/**
 * Registra una nueva cuenta contable o bancaria asociada a una escuela.
 * * @async
 * @function crearCuentaEscuela
 * @param {CuentaEscuelaInput} cuentaData - Objeto con la información de la cuenta a crear.
 * @param {number} cuentaData.id_escuela - ID único de la escuela propietaria de la cuenta.
 * @param {string} cuentaData.nombre_cuenta - Nombre descriptivo (ej: "Caja Chica", "Banco Macro").
 * @param {string} cuentaData.tipo_cuenta - Categoría de la cuenta (ej: "efectivo", "banco", "virtual").
 * @param {string} [cuentaData.estado] - Estado inicial de la cuenta (activo/inactivo).
 * * @returns {Promise<TipadoData<{nombre_cuenta: string, tipo_cuenta: string}>>} 
 * Promesa que resuelve con un objeto estandarizado conteniendo el nombre y tipo de la cuenta creada.
 * * @example
 * const nuevaCuenta = await crearCuentaEscuela({
 * id_escuela: 1,
 * nombre_cuenta: "Caja Central",
 * tipo_cuenta: "efectivo",
 * estado: "activo"
 * });
 */
const crearCuentaEscuela = async (cuentaData: CuentaEscuelaInput) 
: Promise<TipadoData<{nombre_cuenta: string, tipo_cuenta: string}>> =>{
    const sql  : string  =`INSERT INTO cuentas_escuela (id_escuela, nombre_cuenta, tipo_cuenta, estado) 
                                VALUES 
                                ( ?, ?, ?, ? )`;
    const { id_escuela, nombre_cuenta, tipo_cuenta, estado} = cuentaData ;                            
    const parametros : unknown[] = [ id_escuela, nombre_cuenta, tipo_cuenta, estado];
    const retorno  = { nombre_cuenta, tipo_cuenta};
    return await iudEntidad<{nombre_cuenta: string, tipo_cuenta: string}>({
        slqEntidad : sql,
        valores : parametros,
        entidad : "CUENTAS",
        metodo : "CREAR",
        datosRetorno : retorno,
    });
};


/**
 * Verifica si ya existe una cuenta con el mismo nombre para una escuela específica.
 * * @param {string} nombreCuenta - El nombre de la caja o billetera (ej: 'Mercado Pago').
 * @param {number} idEscuela - El ID de la academia a la que pertenece la cuenta.
 * @returns {Promise<"CUENTAS_EXISTE" | "CUENTAS_NO_EXISTE">} 
 * Retorna un código de string según el resultado de la búsqueda en la base de datos.
 */
const verificarCuentaEscuela = async ( nombreCuenta : string , idEscuela : number) =>{

     const sql  : string  =`select id_cuenta from cuentas_escuela
                            where nombre_cuenta = ?    and id_escuela = ? ;`;
     const parametros : unknown[] = [nombreCuenta,  idEscuela];
     
     return buscarExistenteEntidad<{id_cuenta : number}>({
        slqEntidad : sql,
        valores : parametros,
        entidad : "CUENTAS"
     })
};


const modCuentaEscuela = async ( dataMod : ModificarCuentaEscuelaUnputs)
: Promise<TipadoData<{id_cuenta : number, nuevo_nombre_cuenta : string ,  nuevo_tipo_cuenta : string}>> => {

    const sql  : string  =`UPDATE cuentas_escuela 
                           SET 
                                nombre_cuenta = ?, 
                                tipo_cuenta = ?
                            WHERE 
                                id_cuenta = ?
                                AND id_escuela = ?;`;
    const { id_cuenta, id_escuela, nuevo_nombre_cuenta, nuevo_tipo_cuenta } = dataMod;     

    const parametros : unknown[] = [nuevo_nombre_cuenta, nuevo_tipo_cuenta,  id_cuenta, id_escuela ];

    const retorno  = { id_cuenta, nuevo_nombre_cuenta, nuevo_tipo_cuenta};     

    return await iudEntidad({
        slqEntidad : sql,
        valores : parametros,
        metodo : "MODIFICAR",
        entidad : "CUENTAS",
        datosRetorno : retorno
    });

};

const estadoCuenta = async ( dataEstado : EstadoCuentasInputs) 
: Promise<TipadoData<{id_cuenta : number, estado : string}>>=>{
   const sql  : string  =`UPDATE cuentas_escuela 
                            SET
                                estado = ?
                            WHERE 
                                id_cuenta = ? 
                                AND id_escuela = ?;`;
   const { estado, id_cuenta, id_escuela} = dataEstado;
   const parametros  : unknown[] = [ estado, id_cuenta, id_escuela ];
   const retorno = { id_cuenta, estado};

   return await iudEntidad({
      slqEntidad: sql,
      valores : parametros,
      metodo : "MODIFICAR", // es modificar ya q es una baja logica
      entidad : "CUENTAS",
      datosRetorno : retorno
   });
};


/**
 * Obtiene un listado paginado y filtrado de las cuentas de una escuela.
 * * @async
 * @function listadoCuentas
 * @param {ListadoCuentasInputs} paramListado - Objeto con los criterios de búsqueda y paginación.
 * @param {string} paramListado.nombre_cuenta - Nombre o parte del nombre de la cuenta para filtrar (LIKE).
 * @param {string} paramListado.tipo_cuenta - Tipo de cuenta ('fisico', 'virtual' o 'todos').
 * @param {number} paramListado.id_escuela - ID único de la escuela a la que pertenecen las cuentas.
 * @param {string} paramListado.estado - Estado de las cuentas a listar (ej: 'activos', 'eliminados').
 * @param {number} paramListado.pagina - Número de página actual para el cálculo de paginación.
 * @param {number} paramListado.limite - Cantidad de registros por página.
 * @param {number} paramListado.offset - Punto de inicio de la consulta (calculado previamente).
 * @param {string} pagina - Número de página en formato string para la respuesta genérica.
 * * @returns {Promise<TipadoData<ResultListadoCuentas[]>>} Retorna una promesa con la estructura de datos 
 * estandarizada, incluyendo el array de cuentas y la información de paginación.
 * * @description
 * La función aplica filtros por nombre y tipo de cuenta usando operadores LIKE. 
 * Si el `tipo_cuenta` es 'todos', se anula el filtro para traer todos los tipos.
 * Utiliza `COUNT(*) OVER()` para obtener el total de registros sin necesidad de una segunda consulta.
 */
const listadoCuentas = async ( paramListado : ListadoCuentasInputs)
: Promise<TipadoData<ResultListadoCuentas[]>> =>{
    const { nombre_cuenta ,  tipo_cuenta, id_escuela , estado ,pagina ,limite,offset} = paramListado;
    
    const nombreFiltro =  `%${nombre_cuenta}%`;
    let tipoFiltro = `%${tipo_cuenta}%`;
  
    if (tipo_cuenta === `todos`){ tipoFiltro = "%%" };
    
    const sql : string = `select
                                id_cuenta,
                                nombre_cuenta,
                                tipo_cuenta,
                                count(*) over() as total_registros
                            from 
                                cuentas_escuela 
                            where 
                                nombre_cuenta like ?
                            and
                                tipo_cuenta like ?
                            and 
                                id_escuela = ?
                            and
		                        estado = ?                              
                            order by 
                                    nombre_cuenta
                            limit ${Number(limite)}
                            offset ${Number(offset)}    
                                    `;
    const parametros : unknown[] = [ nombreFiltro, tipoFiltro, id_escuela , estado];

    return listarEntidad<ResultListadoCuentas>({
        slqListado : sql,
        valores : parametros,
        limit : limite,
        pagina : String(pagina),
        entidad : "Tipo_Cuentas",
        estado
    });
};

export const method = {
    crearCuentaEscuela : tryCatchDatos( crearCuentaEscuela ),
    verificarCuentaEscuela : tryCatchDatos( verificarCuentaEscuela ),
    modCuentaEscuela : tryCatchDatos(modCuentaEscuela ), 
    estadoCuenta : tryCatchDatos( estadoCuenta ),
    listdoCuentasDatos : tryCatchDatos( listadoCuentas )
};