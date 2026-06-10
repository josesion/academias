import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataNiveles } from "../data/niveles.data"; 


import { TipadoData } from "../tipados/tipado.data";
import { ResulListadoNivelUsuarios } from "../tipados/nivel.data";
import { CrearNivelSchema , ModificarNivelSchema, EstadoNivelSchema, ListaNivelesUsuariosSchema,
         CrearNivelInput ,  ModificarNivelInput, EstadoNivelInput, ListadoNivelInput,
         ListadoNivelSinPagInput, ListaNivelesUsuarioSinPagSchema
        } from "../squemas/nivel";

/**
 * Crea un nuevo nivel en una escuela.
 *
 * Valida los datos recibidos, verifica que el nivel no exista
 * previamente en la escuela y registra el nuevo nivel.
 *
 * @async
 * @param {CrearNivelInput} data - Información del nivel a crear.
 * @returns {Promise<TipadoData<{ nivel: string }>>}
 *
 * @throws {ZodError}
 * Puede lanzar un error de validación si los datos no cumplen
 * con el esquema definido en CrearNivelSchema.
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
 * Modifica un nivel existente en una escuela.
 *
 * Valida los datos recibidos, verifica que el nuevo nombre
 * del nivel no se encuentre registrado previamente y realiza
 * la actualización correspondiente.
 *
 * @async
 * @param {ModificarNivelInput} dataM - Información del nivel a modificar.
 * @returns {Promise<TipadoData<{ nivel: string }>>}
 *
 * @throws {ZodError}
 * Puede lanzar un error de validación si los datos no cumplen
 * con el esquema definido en ModificarNivelSchema.
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
 * Cambia el estado de un nivel.
 *
 * Valida los datos recibidos y actualiza el estado
 * del nivel correspondiente en la escuela.
 *
 * @async
 * @param {EstadoNivelInput} estado - Información necesaria para modificar el estado.
 * @returns {Promise<TipadoData<{ id: number }>>}
 *
 * @throws {ZodError}
 * Puede lanzar un error de validación si los datos no cumplen
 * con el esquema definido en EstadoNivelSchema.
 */
const estadoNivel = async ( estado : EstadoNivelInput)  
: Promise<TipadoData<{ id : number }>>  => {

       const dataNivel : EstadoNivelInput = EstadoNivelSchema.parse( estado ); 

       const estadoNivel = await dataNiveles.cambioEstado(dataNivel);
    
       if (estadoNivel.code ===  "NIVEL_MODIFICAR" ){
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