
// Hooks seccion 
import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";

// Tipados seccion
import { TipadoData } from "../tipados/tipado.data"; 
import { CuentaEscuelaInput, ModificarCuentaEscuelaUnputs } from "../squemas/cuentas.escuelas";

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


export const method = {
    crearCuentaEscuela : tryCatchDatos( crearCuentaEscuela ),
    verificarCuentaEscuela : tryCatchDatos( verificarCuentaEscuela ),
    modCuentaEscuela : tryCatchDatos(modCuentaEscuela )
};