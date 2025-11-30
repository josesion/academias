import { Request , Response } from "express";
// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────
import { method as dataTipo } from "../data/tipo_clases.data";

// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch"; 
import { enviarResponseError } from "../utils/responseError";
import { enviarResponse } from "../utils/response"; 
import { fechaHoy } from "../hooks/fecha";
// ──────────────────────────────────────────────────────────────
// Sección de Typado
// ──────────────────────────────────────────────────────────────
import { CrearTipoSchema , CrearTipoInput , ModTipoInput , ModTipoSchema ,
         EstadoTipoInput , EstadoTipoSchema, ListaTipoUsuariosSchema, ListadoTipoInput
        } from "../squemas/tipo.usuarios";
import { CodigoEstadoHTTP } from "../tipados/generico";


/**
 * @async
 * @function altaTipo
 * @description Manejador de ruta para registrar un nuevo tipo de clase. Realiza la validación de los datos 
 * de entrada, verifica si ya existe un tipo de clase con el mismo nombre para la 'id_escuela' dada, 
 * y si no existe, procede con la inserción en la base de datos.
 * * @param {Request} req - Objeto de solicitud de Express. Se espera que el body contenga 'tipo' e 'id_escuela'.
 * @param {Response} res - Objeto de respuesta de Express. Utilizado para enviar la respuesta HTTP.
 * * @returns {Promise<Response>} Retorna una Promesa que resuelve en el objeto de respuesta de Express.
 * * @throws {ZodError} Si la validación de los datos de entrada falla contra el esquema 'CrearTipoSchema'.
 * * @body {string} tipo - El nombre del nuevo tipo de clase a crear.
 * @body {number} id_escuela - El ID de la escuela a la que pertenecerá el tipo de clase.
 * * @response 200 OK: 
 * Si el tipo de clase se crea exitosamente (Aunque el código HTTP estándar para creación es 201). Mensaje: "Se agrego Tipo correctante".
 * @response 403 Prohibido: 
 * Si un tipo de clase con el mismo nombre ya existe para la escuela dada. Mensaje: "Este Tipo :[nombre_tipo] ya existe".
 */

const altaTipo = async( req : Request, res : Response) =>{
   const { tipo , id_escuela}  = req.body;

   const data : CrearTipoInput = CrearTipoSchema.parse({
        tipo : tipo,
        fecha_creacion : fechaHoy(),
        id_escuela : Number(id_escuela)
   }); 

   const existeTipo =await dataTipo.verificar( tipo , id_escuela);

   if (existeTipo.code === 'TIPO_NO_EXISTE'){
        const alta = await dataTipo.altaTipo(data);
        if (alta.code === "TIPO_CREAR"){
            return enviarResponse(
                res, 
                CodigoEstadoHTTP.OK,
                `Se agrego Tipo correctante`,
                alta.data,
                undefined,
                alta.code
            );
        }
   }else{
        return enviarResponseError(
            res,
            CodigoEstadoHTTP.PROHIBIDO,
            `Este Tipo :${tipo} ya existe`
        );
   };
};

/**
 * @async
 * @function modTipo
 * @description Manejador de ruta para modificar la descripción de un tipo de clase existente.
 * Obtiene el nuevo nombre del tipo de clase de `req.body` y los identificadores (ID del tipo y ID de la escuela) de `req.params`.
 * Realiza la validación de los datos y llama al servicio para ejecutar la modificación.
 * * @param {Request} req - Objeto de solicitud de Express. 
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Retorna una Promesa que resuelve en el objeto de respuesta de Express.
 * * @throws {ZodError} Si la validación de los datos de entrada falla contra el esquema 'ModTipoSchema'.
 * * @path /tipos/:id/:id_escuela
 * @method PUT
 * * @body {string} tipo - La nueva descripción del tipo de clase.
 * @params {string} id - El ID del tipo de clase a modificar.
 * @params {string} id_escuela - El ID de la escuela a la que pertenece el tipo.
 * * @response 200 OK: 
 * Si el tipo de clase se modifica exitosamente. Mensaje: "El Tipo : [nuevo_tipo] ,Se modifico".
 */

const modTipo = async( req : Request, res : Response ) => {
    const { tipo } = req.body;
    const { id_escuela , id } = req.params;

    const data : ModTipoInput = ModTipoSchema.parse({
        tipo : tipo,
        id   : Number(id),
        id_escuela : Number(id_escuela)
    });
  
    const mod = await dataTipo.modficarTipo(data);

    if ( mod.code === 'TIPO_MODIFICAR' ){
        return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            `El Tipo : ${tipo} ,Se modifico `,
            mod.data,
            undefined,
            mod.code
        );
    }
};

/**
 * @async
 * @function estadoTipo
 * @description Manejador de ruta para cambiar el estado (activo/inactivo) de un tipo de clase específico.
 * Obtiene el ID del tipo, el ID de la escuela y el nuevo estado de los parámetros de la URL.
 * Realiza la validación de los datos y llama al servicio para ejecutar el cambio de estado en la base de datos.
 * * @param {Request} req - Objeto de solicitud de Express.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Retorna una Promesa que resuelve en el objeto de respuesta de Express.
 * @throws {ZodError} Si la validación de los datos de entrada falla contra el esquema 'EstadoTipoSchema'.
 * * @path /tipos/estado/:id/:id_escuela/:estado
 * @method PUT o PATCH
 * * @params {string} id - El ID del tipo de clase cuyo estado será modificado.
 * @params {string} id_escuela - El ID de la escuela a la que pertenece el tipo.
 * @params {string} estado - El nuevo estado a aplicar (ej: 'activos' o 'inactivos').
 * * @response 200 OK: 
 * Si el estado del tipo de clase se modifica exitosamente. El cuerpo de la respuesta contiene los datos de confirmación (estadoTipo.data). Mensaje de respuesta vacío.
 */

const estadoTipo = async( req : Request, res : Response ) =>{
    const { id_escuela , id , estado} = req.params;
  //  console.log( id , estado , id_escuela)
    const data : EstadoTipoInput = EstadoTipoSchema.parse({
        estado : estado,  id : Number(id) , id_escuela : Number(id_escuela)
    });
   
    const estadoTipo = await dataTipo.estadoTipo(data);

    if ( estadoTipo.code === 'TIPO_MODIFICAR') {
        return enviarResponse(
            res, 
            CodigoEstadoHTTP.OK,
            ``,
            estadoTipo.data,
            undefined,
            estadoTipo.code
        );
    };
};

/**
 * @async
 * @function listadoTipo
 * @description Manejador de ruta para obtener un listado paginado de tipos de clase. 
 * Obtiene los parámetros de filtro ('tipo', 'estado', 'id_escuela') y paginación ('pagina', 'limite') de `req.query`.
 * Calcula el 'offset' necesario para la consulta, valida los datos y llama al servicio para obtener la lista.
 * * @param {Request} req - Objeto de solicitud de Express. Los parámetros de paginación y filtro se esperan en 'req.query'.
 * @param {Response} res - Objeto de respuesta de Express.
 * @returns {Promise<Response>} Retorna una Promesa que resuelve en el objeto de respuesta de Express.
 * * @throws {ZodError} Si la validación de los datos de entrada falla contra el esquema 'ListaTipoUsuariosSchema'.
 * * @path /tipos/listado
 * @method GET
 * * @query {string} tipo - (Opcional) Filtro por la descripción del tipo de clase.
 * @query {string} estado - Filtro por estado ('activos'/'inactivos').
 * @query {string} id_escuela - El ID de la escuela para filtrar los tipos.
 * @query {string} limite - El número máximo de registros a devolver por página.
 * @query {string} pagina - El número de página solicitada (usada para calcular el offset).
 * * @response 200 OK: 
 * Si la operación es exitosa (ya sea que devuelva datos o un mensaje de lista vacía). El cuerpo incluye los datos y la información de paginación.
 */

const listadoTipo = async( req : Request, res : Response ) =>{
    const { tipo , estado , id_escuela , pagina , limite } = req.query;

    const offset = ( Number(pagina) -1 ) * Number(limite) ;

    const data : ListadoTipoInput = ListaTipoUsuariosSchema.parse({
        tipo : tipo,
        estado : estado,
        id_escuela : Number(id_escuela),
        limite     : Number(limite),
        offset : offset
    });

    const dataListado = await dataTipo.listado(data , pagina);

    if (dataListado.code === "TIPO_LISTED"){
        return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            dataListado.message,
            dataListado.data ,
            dataListado.paginacion,
            dataListado.code
        );
    }else{
        return enviarResponseError(
            res,
            CodigoEstadoHTTP.OK,
            dataListado.message,

        );
    };
};


export const method = {
    registro : tryCatch( altaTipo ),
    modTipo  : tryCatch( modTipo ),
    estado   : tryCatch( estadoTipo),
    listado  : tryCatch( listadoTipo)
};