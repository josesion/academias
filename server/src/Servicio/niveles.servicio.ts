import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataNiveles } from "../data/niveles.data"; 
import { registroHistorial } from "../utils/postHistorial";

import { TipadoData } from "../tipados/tipado.data";
import { ResulListadoNivelUsuarios } from "../tipados/nivel.data";
import { CrearNivelSchema , ModificarNivelSchema, EstadoNivelSchema, ListaNivelesUsuariosSchema,
         CrearNivelInput ,  ModificarNivelInput, EstadoNivelInput, ListadoNivelInput,
         ListadoNivelSinPagInput, ListaNivelesUsuarioSinPagSchema
        } from "../squemas/nivel";
import { type HistorialInputs } from "../squemas/historial";


/**
 * Servicio encargado de gestionar el alta o registro de un nuevo nivel,
 * validando los datos mediante Zod, comprobando que no exista previamente en la escuela,
 * realizando la inserción en la base de datos y registrando la acción en el historial de auditoría.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `CrearNivelSchema`.
 * 2. Comprueba si el nivel ya existe en la escuela (`dataNiveles.nivelExiste`); de ser así, deniega la creación.
 * 3. Ejecuta la inserción en la capa de datos (`dataNiveles.altaNivelGlobal`).
 * 4. Construye y registra el evento correspondiente en el historial de auditoría (`registroHistorial`).
 * 5. Verifica si el código de la operación es exitoso ('NIVEL_CREAR') para retornar el resultado de éxito,
 *    o un error de servidor en caso contrario.
 *
 * @async
 * @function altaNivel
 * @param {CrearNivelInput} data - Objeto con los datos necesarios para crear el nivel 
 * (incluyendo nombre, fecha de creación, ID de escuela, indicador por defecto e ID de usuario).
 * 
 * @returns {Promise<TipadoData<{nivel: string}>>} Promesa que resuelve con el estado de la operación de alta,
 * incluyendo mensajes descriptivos y códigos internos de éxito o error.
 * 
 * @throws {ZodError} Si la estructura de los datos de entrada no cumple con `CrearNivelSchema`.
 * 
 * @example
 * const resultado = await altaNivel({
 *    nivel: "Principiante",
 *    fecha_creacion: "2026-07-22",
 *    id_escuela: 1,
 *    is_default: false,
 *    id_usuario: 5
 * });
 */
const altaNivel = async ( data : CrearNivelInput)
: Promise<TipadoData<{ nivel : string }>> => {
    
    const dataNivel : CrearNivelInput = CrearNivelSchema.parse(data);

    const nivelExiste = await dataNiveles.nivelExiste( dataNivel.nivel , dataNivel.id_escuela ); 

    if ( nivelExiste.code === "NIVEL_EXISTE" ){
        return {
            error : true,
            message : "El nivel existe ya en la escuela.",
            code : "NIVEL_EXISTE"
        };
    };

    const nuevoNivel = await dataNiveles.altaNivelGlobal( dataNivel );

    const dataHistorial  : HistorialInputs = {
        id_escuela :  dataNivel.id_escuela ,
        id_usuario :  dataNivel.id_usuario,
        modulo : "NIVELES_BAILE",
        accion : "CREAR",
        id_registro: Number( nuevoNivel.data?.id),
        descripcion: `Registro Nivel de baile : ${dataNivel.nivel}`,
        datos: {
            id_nivel : nuevoNivel.data?.id,
            nivel : nuevoNivel.data?.nivel
        }
    }; 
            
    await registroHistorial( dataHistorial); 

    if ( nuevoNivel.code === "NIVEL_CREAR" ){
        return {
            error : false,
            message : "Se creo correctamene el nivel",
            code : "NIVEL_ALTA_OK"
        };
    };


    return{
        error : true,
        message : "Error en el servidor , nivel",
        code : "ERROR_SERVIDOR"
    };

};

/**
 * Servicio encargado de gestionar la modificación de un nivel existente,
 * validando duplicados en la escuela mediante Zod y registrando la acción en el historial de auditoría.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `ModificarNivelSchema`.
 * 2. Comprueba si el nuevo nombre del nivel ya existe en la escuela (`NIVEL_EXISTE`); de ser así, deniega la modificación.
 * 3. Ejecuta la actualización en la capa de datos (`dataNiveles.modificarNivel`).
 * 4. Si la operación es exitosa (código 'NIVEL_MODIFICAR'):
 *    - Construye el objeto con los detalles de la modificación para el historial de auditoría.
 *    - Registra el evento en el sistema mediante `registroHistorial`.
 * 5. Retorna el resultado estandarizado con el mensaje de éxito, o un error de servidor en caso de fallo.
 *
 * @async
 * @function modificarNivel
 * @param {ModificarNivelInput} dataM - Objeto con los datos necesarios para modificar el nivel 
 * (incluyendo ID del nivel, nuevo nombre, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<TipadoData<{nivel: string}>>} Promesa que resuelve con el estado de la modificación,
 * incluyendo mensajes descriptivos y códigos internos de éxito o error.
 * 
 * @throws {ZodError} Si la estructura de los datos de entrada no cumple con `ModificarNivelSchema`.
 * 
 * @example
 * const resultado = await modificarNivel({
 *    id: 1,
 *    nivel: "Avanzado Plus",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
 */
const modificarNivel = async ( dataM : ModificarNivelInput) 
: Promise<TipadoData<{ nivel : string}>> => {
   
    const dataNivel : ModificarNivelInput = ModificarNivelSchema.parse( dataM );

    const existe = await dataNiveles.nivelExiste( dataNivel.nivel , Number(dataNivel.id_escuela));

    if ( existe.code === "NIVEL_EXISTE"){
        return{
            error : true,
            message : "Este nivel el mismo o ya existe.",
            code : "NIVEL_EXISTE"
        };
    };

   const nivelModificado = await dataNiveles.modificarNivel( dataNivel );   

   if( nivelModificado.code === "NIVEL_MODIFICAR" ){

    const dataHistorial  : HistorialInputs = {
        id_escuela :  dataNivel.id_escuela ,
        id_usuario :  dataNivel.id_usuario,
        modulo : "NIVELES_BAILE",
        accion : "MODIFICAR",
        id_registro: Number( dataNivel.id),
        descripcion: `Modificacion de  : ${dataNivel.nivel}`,
        datos: {
            id_nivel : dataNivel.id,
            nivel : dataNivel.nivel
        }
    }; 
            
    await registroHistorial( dataHistorial); 

      return {
           error : false, 
           message : "Se modifico correctamente el Nivel",
           code : "MOD_NIVEL_OK"
      };  
   };

   return{
        error : true,
        message : "Error en el servidor , nivel",
        code : "ERROR_SERVIDOR"
   };

}; 


/**
 * Servicio encargado de gestionar el cambio de estado (activación o baja lógica) de un nivel,
 * validando los datos de entrada mediante Zod y registrando la acción en el historial de auditoría.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `EstadoNivelSchema`.
 * 2. Ejecuta la actualización del estado en la capa de datos (`dataNiveles.cambioEstado`).
 * 3. Si la operación es exitosa (código 'NIVEL_MODIFICAR'):
 *    - Determina dinámicamente el estado final ("activo" / "inactivo") y la acción de auditoría ("RESTAURAR" / "ELIMINAR").
 *    - Construye el objeto con los detalles del cambio para el historial de auditoría, incluyendo el nombre y ID del nivel.
 *    - Registra el evento en el sistema mediante `registroHistorial`.
 * 4. Retorna el resultado estandarizado con el mensaje de éxito, o un error de servidor en caso de fallo.
 *
 * @async
 * @function estadoNivel
 * @param {EstadoNivelInput} estado - Objeto con los datos necesarios para cambiar el estado del nivel 
 * (incluyendo ID del nivel, nombre, estado deseado, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<TipadoData<{id: number}>>} Promesa que resuelve con el estado de la operación,
 * incluyendo mensajes descriptivos y códigos internos de éxito o error.
 * 
 * @throws {ZodError} Si la estructura de los datos de entrada no cumple con `EstadoNivelSchema`.
 * 
 * @example
 * const resultado = await estadoNivel({
 *    id: 1,
 *    nivel: "Principiante",
 *    estado: "inactivos",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
 */
const estadoNivel = async ( estado : EstadoNivelInput)  
: Promise<TipadoData<{ id : number }>>  => {

       const dataNivel : EstadoNivelInput = EstadoNivelSchema.parse( estado ); 

       const estadoNivel = await dataNiveles.cambioEstado(dataNivel);
    
       if (estadoNivel.code ===  "NIVEL_MODIFICAR" ){

        const estadoFinal  =  dataNivel.estado === "activos" ? "activo" : "inactivo";
        const accionFinal  =  dataNivel.estado === "activos" ? "RESTAURAR" : "ELIMINAR"


            const dataHistorial  : HistorialInputs = {
                id_escuela :  dataNivel.id_escuela ,
                id_usuario :  dataNivel.id_usuario,
                modulo : "NIVELES_BAILE",
                accion : accionFinal,
                id_registro: Number( dataNivel.id),
                descripcion: `Estado de ${dataNivel.nivel} cambio a  ${estadoFinal}`,
                datos: {
                    id_nivel : dataNivel.id,
                    nivel : dataNivel.nivel
                }
            }; 
                    
            await registroHistorial( dataHistorial);         

           return {
                error : false, 
                message : "Se modifico el estado correctamente.",
                code : "ESTADO_NIVEL_OK"
           };
       };

     return{
         error : true,
         message : "Error en el servidor , nivel",
         code : "ERROR_SERVIDOR"
     };      
};


/**
 * Obtiene el listado de niveles de una escuela.
 *
 * Valida los filtros recibidos, consulta los niveles registrados
 * y devuelve los resultados junto con la información de paginación.
 *
 * @async
 * @param {ListadoNivelInput} listado - Parámetros de búsqueda y paginación.
 * @returns {Promise<TipadoData<ResulListadoNivelUsuarios[]>>}
 *
 * @throws {ZodError}
 * Puede lanzar un error de validación si los datos no cumplen
 * con el esquema definido en ListaNivelesUsuariosSchema.
 */
const listadoNivel = async( listado : ListadoNivelInput )
: Promise<TipadoData<ResulListadoNivelUsuarios[]>> =>{

    const paramListado: ListadoNivelInput = ListaNivelesUsuariosSchema.parse( listado ); 

    const dataListado = await dataNiveles.listado( paramListado , Number(paramListado.pagina) );

    if ( dataListado.code === "NIVEL_LISTED") {
        return {
            error : false,
            message : "Listado de niveles",
            data : dataListado.data,
            paginacion : dataListado.paginacion,
            code : "LISTADO_NIVELES_OK"
        };
    };

    if ( dataListado.code === 'NO_ACTIVE_NIVEL') {
        return {
           error : true,
           message : "Sin listado de niveles",
           code : "SIN_LISTADO_NIVELES"            
        };
    };

    return{
         error : true,
         message : "Error en el servidor , nivel",
         code : "ERROR_SERVIDOR"
    }; 

};


/**
 * Obtiene el listado de niveles sin aplicar paginación.
 *
 * Valida los filtros recibidos y devuelve todos los niveles
 * que coincidan con los criterios de búsqueda.
 *
 * @async
 * @param {ListadoNivelSinPagInput} listado - Parámetros de búsqueda.
 * @returns {Promise<TipadoData<ResulListadoNivelUsuarios[]>>}
 *
 * @throws {ZodError}
 * Puede lanzar un error de validación si los datos no cumplen
 * con el esquema definido en ListaNivelesUsuarioSinPagSchema.
 */
const listadoNivelSinPag = async(  listado :  ListadoNivelSinPagInput  ) =>{

    const paramListado: ListadoNivelSinPagInput = ListaNivelesUsuarioSinPagSchema.parse( listado );

    const dataListado = await dataNiveles.listadoNivelSinPag( paramListado );

    if ( dataListado.code === "NIVEL_LISTED") {
        return {
            error : false,
            message : "Listado de niveles",
            data : dataListado.data,
            code : "LISTADO_NIVELES_OK"
        };
    };    
    
    if ( dataListado.code === "NO_ACTIVE_NIVEL") {
         return {
           error : true,
           message : "Sin listado de niveles",
           code : "SIN_LISTADO_NIVELES"            
        };       
    };


    return{
         error : true,
         message : "Error en el servidor , nivel",
         code : "ERROR_SERVIDOR"
    }; 

};


export const method = {
    altaNivel : tryCatchDatos( altaNivel ),
    modNivel  : tryCatchDatos( modificarNivel),
    estadoNivel : tryCatchDatos( estadoNivel ),
    listadoNivel : tryCatchDatos( listadoNivel ),
    listadoNivelSinPag : tryCatchDatos( listadoNivelSinPag ),
};