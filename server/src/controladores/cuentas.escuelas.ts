import { Request, Response } from 'express';

import { method as cuentaServicio } from "../Servicio/cuentas.escuelas";
//  Hooks seccion -----------------------
import { tryCatch } from '../utils/tryCatch';
import { handleControladores } from "../utils/handleControladores";
// Tipados seccion ----------------------


// Respuestas Seccion --------------------------
import { MAPA_CUENTAS_MODIFICACION, MAPA_CUENTAS_CREACCION,MAPA_CUENTAS_ESTADO, 
         MAPA_CUENTAS_LISTADO,
} from '../respuestas/cuentas.escuelas';

import { CuentaEscuelaInput,
         ModificarCuentaEscuelaUnputs, 
         EstadoCuentasInputs, 
         ListadoCuentasInputs,
 } from "../squemas/cuentas.escuelas";


 /**
 * Controlador encargado de gestionar la petición HTTP para la creación de una nueva cuenta de la escuela.
 * Extrae los datos del cuerpo de la petición (`body`) y la información del usuario autenticado,
 * construyendo el objeto de entrada tipado y delegando la ejecución al manejador genérico de controladores.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Construye el objeto de tipo `CuentaEscuelaInput` recopilando el ID de escuela, nombre y tipo de cuenta del cuerpo de la petición, asignando un estado inicial por defecto ("activos"), y obteniendo el ID de usuario de la sesión autenticada.
 * 2. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `cuentaServicio.crearCuentaServicios` y el mapa de códigos de error/éxito (`MAPA_CUENTAS_CREACCION`).
 *
 * @async
 * @function crearCuentaEscuela
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo el cuerpo de la solicitud y los datos del usuario autenticado.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición POST esperada:
 * // /cuentas
 * // Body: { "nombre_cuenta": "Caja Chica", "tipo_cuenta": "Efectivo" }
 */
const crearCuentaEscuela = async ( req : Request, res : Response) => {
  
    const dataCuenta : CuentaEscuelaInput = {
        id_escuela : Number(req.usuario?.id_escuela),
        nombre_cuenta : req.body.nombre_cuenta,
        tipo_cuenta : req.body.tipo_cuenta,
        estado : "activos",
        id_usuario : Number(req.usuario?.id)
    };  

    await handleControladores<CuentaEscuelaInput, { nombre_cuenta : string , tipo_cuenta : string }>(
        res, dataCuenta, cuentaServicio.crearCuentaServicios, MAPA_CUENTAS_CREACCION
    );
    
};

  
/**
 * Controlador encargado de gestionar la petición HTTP para modificar una cuenta existente de la escuela.
 * Extrae el ID de la cuenta de los parámetros de la ruta, los datos actualizados del cuerpo de la petición (`body`),
 * y la información del usuario autenticado, construyendo el objeto de entrada tipado para delegar la ejecución
 * al manejador genérico de controladores.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Muestra un registro en consola (`console.log(2)`).
 * 2. Construye el objeto de tipo `ModificarCuentaEscuelaUnputs` recopilando el ID de cuenta de los parámetros, el nuevo nombre y tipo del cuerpo de la petición, y el ID de escuela y de usuario extraídos de la sesión.
 * 3. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `cuentaServicio.modCuentaEscuelaServicio` y el mapa de códigos de error/éxito (`MAPA_CUENTAS_MODIFICACION`).
 *
 * @async
 * @function modCuentaEscuela
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo los parámetros de ruta, el cuerpo de la solicitud y los datos del usuario autenticado.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición PUT esperada:
 * // /cuentas/2
 * // Body: { "nuevo_nombre_cuenta": "Caja Principal", "nuevo_tipo_cuenta": "Efectivo" }
 */
const modCuentaEscuela = async ( req : Request, res : Response) => {

    const dataMod :  ModificarCuentaEscuelaUnputs = {
        id_cuenta : Number(req.params.id_cuenta),
        id_escuela : Number(req.usuario?.id_escuela),
        nuevo_nombre_cuenta : req.body.nuevo_nombre_cuenta,
        nuevo_tipo_cuenta : req.body.nuevo_tipo_cuenta,
        id_usuario : Number(req.usuario?.id)    
    };

    await handleControladores< ModificarCuentaEscuelaUnputs, {id_cuenta: number, nuevo_nombre_cuenta : string, nuevo_tipo_cuenta : string}>(
        res, dataMod, cuentaServicio.modCuentaEscuelaServicio,  MAPA_CUENTAS_MODIFICACION
    );
      
};

/**
 * Controlador encargado de gestionar la petición HTTP para cambiar el estado (activar/inactivar) de una cuenta de la escuela.
 * Extrae los parámetros de la ruta (`params`) y los datos del usuario autenticado, construye el objeto de entrada tipado
 * y delega la ejecución al manejador genérico de controladores junto con el servicio correspondiente.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Muestra un registro en consola (`console.log(3)`).
 * 2. Construye el objeto de tipo `EstadoCuentasInputs` recopilando el estado y el ID de cuenta de los parámetros de la ruta, junto con el ID de escuela y de usuario extraídos de la sesión del usuario.
 * 3. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `cuentaServicio.estadoCuentasEscuelaServicio` y el mapa de códigos de error/éxito (`MAPA_CUENTAS_ESTADO`).
 *
 * @async
 * @function estadoCuentasEscuela
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo los parámetros de ruta y los datos del usuario autenticado.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición PATCH esperada:
 * // /cuentas/1/inactivos
 */
const estadoCuentasEscuela = async ( req : Request , res : Response) =>{
  
        const data : EstadoCuentasInputs = {
            estado : req.params.estado as  "activos" | "inactivos",
            id_escuela : Number(req.usuario?.id_escuela),
            id_cuenta : Number(req.params.id_cuenta),
            id_usuario : Number(req.usuario?.id)     
        };

        await handleControladores<EstadoCuentasInputs,{ id_cuenta : number , estado : string}>(
            res, data , cuentaServicio.estadoCuentasEscuelaServicio, MAPA_CUENTAS_ESTADO
        );

};

/**
 * Controlador encargado de gestionar la petición HTTP para listar las cuentas de la escuela con paginación y filtros.
 * Extrae los parámetros de la consulta (`query`), calcula el `offset`, construye el objeto de entrada tipado
 * y delega la ejecución al manejador genérico de controladores junto con el servicio correspondiente.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Extrae los parámetros `pagina` y `limit` de la query de la petición para calcular el desplazamiento (`offset`).
 * 2. Construye el objeto de tipo `ListadoCuentasInputs` recopilando el límite, página, ID de escuela (extraído del usuario autenticado), estado, nombre, tipo de cuenta y offset.
 * 3. Ejecuta la función `handleControladores` pasando la respuesta (`res`), los datos estructurados, el servicio `cuentaServicio.listadoCuentasServicio` y el mapa de códigos de error/éxito (`MAPA_CUENTAS_LISTADO`).
 *
 * @async
 * @function listaCuentas
 * @param {import('express').Request} req - Objeto de la petición HTTP de Express, conteniendo los parámetros de consulta y datos del usuario.
 * @param {import('express').Response} res - Objeto de la respuesta HTTP de Express.
 * 
 * @returns {Promise<void>} No retorna un valor directo, sino que envía la respuesta HTTP al cliente a través del manejador.
 * 
 * @example
 * // Petición GET esperada:
 * // /cuentas?pagina=1&limit=10&estado=activos&tipo_cuenta=fisico
 */
const listaCuentas =  async ( req : Request, res : Response) =>{

     const { pagina , limit } = req.query;
     const offset = ( Number(pagina) -1 ) * Number(limit) ;


    const data :  ListadoCuentasInputs= {
        limite : Number(req.query.limit),
        pagina : Number(req.query.pagina),
        id_escuela : Number(req.usuario?.id_escuela),
        estado : req.query.estado as "activos" | "inactivos",
        nombre_cuenta : req.query.nombre_cuenta as string,
        tipo_cuenta  : req.query.tipo_cuenta as "fisico" | "virtual" | "todos" | "%",
        offset 
    };

    await handleControladores< ListadoCuentasInputs, {}>(
        res, data , cuentaServicio.listadoCuentasServicio, MAPA_CUENTAS_LISTADO
    );
    
};

export const method = {
    crearCuentaEscuela : tryCatch( crearCuentaEscuela ),
    modCuentaEscuela : tryCatch( modCuentaEscuela ),
    estadoCuentasEscuela : tryCatch( estadoCuentasEscuela),
    listaCuentas : tryCatch( listaCuentas)
};