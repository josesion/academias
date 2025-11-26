import { Request , Response } from "express";
// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────
import { method as dataNiveles } from "../data/niveles.data"; 

// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────

import { tryCatch } from "../utils/tryCatch"; 
import { enviarResponseError } from "../utils/responseError";
import { enviarResponse } from "../utils/response";
import { fechaHoy } from "../hooks/fecha"; 
// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { CrearNivelSchema , ModificarNivelSchema, EstadoNivelSchema, ListaNivelesUsuariosSchema,
         CrearNivelInput ,  ModificarNivelInput, EstadoNivelInput, ListadoNivelInput,
        } from "../squemas/nivel";
import {  CodigoEstadoHTTP } from "../tipados/generico";

/**
 * @async
 * @function altaNivel
 * @description Manejador de ruta para registrar un nuevo nivel. Realiza validación de datos, 
 * verifica si el nivel ya existe en la escuela especificada y, si no existe, 
 * procede a crearlo.
 * * @param {Request} req - Objeto de solicitud de Express. Se espera que el body contenga 'nivel' y 'id_escuela'.
 * @param {Response} res - Objeto de respuesta de Express. Utilizado para enviar la respuesta HTTP.
 * * @returns {Promise<Response>} Retorna una Promesa que resuelve en el objeto de respuesta de Express.
 * * @throws {ZodError} Si la validación de los datos de entrada ('nivel', 'id_escuela', 'fecha_creacion') falla 
 * contra el esquema 'CrearNivelSchema'.
 * * @example
 * // En el body de la solicitud (req.body):
 * // { "nivel": "Primario", "id_escuela": 101 }
 * * @response 201 Creado: 
 * Si el nivel se crea exitosamente. Mensaje: "Nivel [nombre_nivel] creado exitosamente."
 * @response 403 Prohibido: 
 * Si el nivel ya existe para el id_escuela especificado. Mensaje: "El nivel : [nombre_nivel] ya existe para la escuela."
 */

const altaNivel = async ( req : Request , res : Response ) => {
    const  { nivel  , id_escuela} = ( req.body );

    const dataNivel : CrearNivelInput = CrearNivelSchema.parse({
        nivel,
        fecha_creacion : fechaHoy(),
        id_escuela
    });

const nivelExiste = await dataNiveles.nivelExiste( dataNivel.nivel , dataNivel.id_escuela );

    if( nivelExiste.code === "NIVEL_NO_EXISTE" ){
        const nuevoNivel = await dataNiveles.altaNivelGlobal( dataNivel );
        if( nuevoNivel.code === "NIVEL_CREAR" ){
            return enviarResponse(
                res,
                CodigoEstadoHTTP.CREADO,
                `Nivel ${nivel} creado exitosamente.`,
                nuevoNivel.data,
                undefined,
                nuevoNivel.code
            );
        }

    }else{
        return enviarResponseError(
            res,
            CodigoEstadoHTTP.PROHIBIDO,
            `El nivel : ${nivel} ya existe para la escuela `,
        );
    }
};

/**
 * @async
 * @function modNivel
 * @description Manejador de ruta para modificar un nivel existente. Obtiene el ID del nivel y el ID de la escuela 
 * de los parámetros de la URL, y la nueva descripción del nivel del cuerpo de la solicitud.
 * Realiza la validación y verifica que el nuevo nombre del nivel no exista ya en la misma escuela.
 * * @param {Request} req - Objeto de solicitud de Express.
 * @param {Response} res - Objeto de respuesta de Express.
 * * @returns {Promise<Response>} Retorna una Promesa que resuelve en el objeto de respuesta de Express.
 * * @throws {ZodError} Si la validación de los datos de entrada (id, nivel, id_escuela) falla contra el esquema 'ModificarNivelSchema'.
 * * @path /niveles/:id/:id_escuela
 * @method PUT
 * * @body {string} nivel - La nueva descripción del nivel.
 * @params {string} id - El ID del nivel a modificar.
 * @params {string} id_escuela - El ID de la escuela a la que pertenece el nivel.
 * * @response 200 OK: 
 * Si el nivel se modifica exitosamente. Mensaje: "Nivel : [nuevo_nivel] modificado exitosamente."
 * * @response 403 Prohibido: 
 * Si la nueva descripción del nivel (nivel) ya existe en la misma escuela. Mensaje: "No se puede modificar [nuevo_nivel], Nivel Ya existe."
 */

const modNivel = async ( req : Request , res : Response ) => {
   
    const { id , id_escuela } = req.params;
    const { nivel } = req.body;

    const dataNivel : ModificarNivelInput = ModificarNivelSchema.parse({
        id : Number(id),
        nivel,
        id_escuela : Number(id_escuela)
    });

    const existe = await dataNiveles.nivelExiste( nivel , Number(id_escuela));


   if ( existe.error === false  ) {
        const nivelModificado = await dataNiveles.modificarNivel( dataNivel );
            if( nivelModificado.code === "NIVEL_MODIFICAR" ){
                return enviarResponse(
                    res,
                    CodigoEstadoHTTP.OK,
                    `Nivel : ${nivel} modificado exitosamente.`,
                    nivelModificado.data,
                    undefined,
                    nivelModificado.code
                );
            }  
   }else{
     return enviarResponseError(
            res,
            CodigoEstadoHTTP.PROHIBIDO,
            `No se puede modificar ${nivel}, Nivel Ya existe`
     );
   }

};

/**
 * @async
 * @function estadoNivel
 * @description Manejador de ruta para cambiar el estado (activo/inactivo) de un nivel específico.
 * Los datos para identificar el nivel ('id', 'id_escuela', 'estado') se obtienen de los parámetros de la URL, 
 * y la descripción del nivel ('nivel') se puede obtener del cuerpo de la solicitud (aunque el cambio se basa en el ID).
 * Realiza la validación de los datos y ejecuta el cambio de estado en la base de datos.
 * * @param {Request} req - Objeto de solicitud de Express.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Retorna una Promesa que resuelve en el objeto de respuesta de Express.
 * @throws {ZodError} Si la validación de los datos de entrada falla contra el esquema 'EstadoNivelSchema'.
 * * @path /niveles/estado/:id/:id_escuela/:estado
 * @method PUT o PATCH (dependiendo de la convención)
 * * @params {string} id - El ID del nivel cuyo estado será modificado.
 * @params {string} id_escuela - El ID de la escuela a la que pertenece el nivel.
 * @params {string} estado - El nuevo estado a aplicar (ej: 'activo' o 'inactivo').
 * @body {string} nivel - (Opcional) La descripción del nivel, utilizada principalmente para mensajes de respuesta.
 * * @response 200 OK: 
 * Si el estado del nivel se modifica exitosamente. Mensaje: "Estado de :[nombre_nivel], cambio existosamente."
 * @response 403 Prohibido: 
 * Si no se pudo completar la operación de cambio de estado. Mensaje: "No se puede modificar el estado de :[nombre_nivel],".
 */

const estadoNivel = async(req : Request , res : Response )=> {

    const { id , id_escuela , estado  } = req.params;
    const { nivel } = req.body ;
   

    const dataNivel : EstadoNivelInput = EstadoNivelSchema.parse({ 
        id : Number(id), 
        id_escuela : Number(id_escuela),
        estado : estado,
        nivel : nivel
    });

        const estadoNivel = await dataNiveles.cambioEstado(dataNivel);

        if ( estadoNivel.code === "NIVEL_MODIFICAR"){
            return enviarResponse(
                res,
                CodigoEstadoHTTP.OK,
                `Estado de :${nivel}, cambio existosamente.`,
                estadoNivel.data,
                undefined,
                estadoNivel.code
            );
        }
  
        return enviarResponseError(
            res, 
            CodigoEstadoHTTP.PROHIBIDO,
            `No se puede modificar el estado de :${nivel},`
        );
};

/**
 * @async
 * @function listadoNivel
 * @description Manejador de ruta para obtener un listado paginado de niveles, aplicando filtros (nivel, estado) y 
 * específicos de escuela (id_escuela). La función calcula el offset a partir de la página y el límite 
 * antes de validar y llamar al servicio de datos.
 * * @param {Request} req - Objeto de solicitud de Express. Los parámetros de paginación y filtro se esperan en 'req.query'.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Retorna una Promesa que resuelve en el objeto de respuesta de Express.
 * * @throws {ZodError} Si la validación de los datos de entrada (incluyendo nivel, estado, id_escuela, limite y offset) 
 * falla contra el esquema 'ListaNivelesUsuariosSchema'.
 * * @path /niveles/listado
 * @method GET
 * * @query {string} nivel - (Opcional) Filtro por descripción del nivel.
 * @query {string} estado - (Opcional) Filtro por estado ('activos'/'inactivos').
 * @query {string} id_escuela - El ID de la escuela para filtrar los niveles.
 * @query {string} limite - El número máximo de registros a devolver por página.
 * @query {string} pagina - El número de página solicitada (se usa para calcular el offset).
 * * @response 200 OK: 
 * Si se encuentran niveles. El cuerpo de la respuesta incluye los datos y la información de paginación. Mensaje: "NIVEL listados activos".
 * @response 200 OK (con error interno): 
 * Si la consulta es exitosa pero no se encuentran datos (ej. lista vacía o error controlado del servicio). Mensaje: "sin listado" o el mensaje de error del servicio.
 */

const listadoNivel = async( req : Request , res : Response ) =>{
    const { nivel , estado, id_escuela , limite, pagina} = req.query;
    const offset = ( Number(pagina) -1 ) * Number(limite) ;

    const paramListado: ListadoNivelInput = ListaNivelesUsuariosSchema.parse({
        nivel : nivel,
        estado : estado,
        id_escuela : Number( id_escuela ),
        limite : Number( limite ),
        offset  : Number( offset )        
    }); 

    const dataListado = await dataNiveles.listado( paramListado , Number(pagina) );

    if ( dataListado.code === "NIVEL_LISTED") {
        return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            `NIVEL listados activos`,
            dataListado.data,
            dataListado.paginacion,
            dataListado.code
        );
    }else {
        console.log("sin listado")
        return enviarResponseError(
            res,
            CodigoEstadoHTTP.OK,
            dataListado.message,
        );
    }

};

export const method = {
    altaNivel : tryCatch( altaNivel ),
    modNivel  : tryCatch( modNivel ),
    estadoNivel : tryCatch( estadoNivel),
    listadoNivel : tryCatch( listadoNivel)
};  