import { tryCatchDatos } from "../utils/tryCatchBD";
import {subirImagenR2 } from "../utils/subirImagen";
import { registroHistorial } from "../utils/postHistorial";
import { eliminarImagenR2 } from "../utils/subirImagen";

import { method as dataFlayer } from "../data/flayer.data"; 

import { TipadoData } from "../tipados/tipado.data";
import {  GuardarFlayerInputs, ImagenFlayerInputs , 
          GuardarFlayerSchema, GuardarImagenSchema,
          IDEscualInputs, IDEscuelaSchema,  
          EliminarFlayerInputs, EliminarFlayerSchema,   
} from "../squemas/flayer";
import { HistorialInputs } from "../squemas/historial";

export interface FlayerData {
    titulo: string;
    descripcion: string;
    imagen_url: string;
}

export interface DataPost  {
 dataTabla : GuardarFlayerInputs, imagen : ImagenFlayerInputs   
};

/**
 * Procesa la creación de un nuevo flayer validando esquemas, límites del plan de la escuela, 
 * restricciones de formato/tamaño de imagen, subida a Cloudinary y persistencia en la base de datos.
 * 
 * @async
 * @function postFlayer
 * @param {DataPost} data - Objeto que contiene los datos de la petición, incluyendo la imagen y la información tabular.
 * @param {Object} data.imagen - Datos de la imagen a subir (buffer, tipo, tamaño).
 * @param {Object} data.dataTabla - Datos del formulario del flayer (id_escuela, título, descripción, plan, etc.).
 * @returns {Promise<TipadoData<FlayerData>>} Una promesa que resuelve con un objeto de tipo `TipadoData`. 
 * Retorna éxito (`error: false`) con los datos del flayer creado, o un error (`error: true`) si se superó el límite del plan, 
 * el formato/tamaño de la imagen es inválido, falla la subida a Cloudinary o surge un error de servidor.
 * @throws {ZodError} Si la validación de los esquemas Zod con `GuardarImagenSchema` o `GuardarFlayerSchema` falla.
 * 
 * @example
 * const datosPeticion = {
 *   imagen: { buffer: <Buffer>, tipo: "image/png", size: 1048576 },
 *   dataTabla: { id_escuela: 1, titulo: "Gran Evento", descripcion: "Baile de apertura", plan: 5 }
 * };
 * const resultado = await postFlayer(datosPeticion);
 */
const postFlayer = async (data: DataPost): Promise<TipadoData<FlayerData>> => {
    const { imagen, dataTabla } = data;

    const validarImagen: ImagenFlayerInputs = GuardarImagenSchema.parse(imagen);
    const dataBdValidada: GuardarFlayerInputs = GuardarFlayerSchema.parse(dataTabla);

    const cantidadFlayersEscuela = await dataFlayer.verificarPlan(dataBdValidada.id_escuela);

    if (cantidadFlayersEscuela.code === "CONTADOR_FLAYES_EXISTE") {
        const cantidadFlayer = cantidadFlayersEscuela.data?.cantidad_flayers ? cantidadFlayersEscuela.data.cantidad_flayers : 0;
  
        if (dataBdValidada.plan <= cantidadFlayer) {
            return {
                error: true, 
                message: "Superó el límite de su plan.",
                code: "SIN_PERMISOS"
            };
        }
    }

    if (
        validarImagen.tipo !== "image/jpeg" &&
        validarImagen.tipo !== "image/png" &&
        validarImagen.tipo !== "image/webp"
    ) {
        return {
            error: true,
            message: "El formato de la imagen no está permitido.",
            code: "FORMATO_IMAGEN_INVALIDO",
        };
    }

    const MAX_SIZE = 2 * 1024 * 1024;

    const sizeBytes = typeof validarImagen.size === 'string' ? parseInt(validarImagen.size, 10) : validarImagen.size;
    if (sizeBytes > MAX_SIZE) {
        return {
            error: true,
            message: "La imagen no puede superar los 2 MB.",
            code: "TAMANO_IMAGEN_INVALIDO",
        };
    }   

    // --- CAMBIO CLAVE: Subimos a Cloudflare R2 en vez de Cloudinary ---
    let fileKey: string;
    try {
        fileKey = await subirImagenR2(validarImagen.buffer, validarImagen.nombre, validarImagen.tipo);
    } catch (error) {
        return {
            error: true,
            message: "No se pudo subir la imagen a Cloudflare R2.",
            code: "ERROR_SUBIR_IMAGEN",
        };
    }

    // Si configuraste un dominio público en R2 (o bucket público), armás la URL completa.
    // Si usas un dominio custom o r.dev, por ejemplo: https://tu-dominio.com/${fileKey}
    // O si guardas la key directamente en la BD:
    const urlImagenFinal = `${process.env.R2_PUBLIC_URL}/${fileKey}`; 

    const dataImagenSubida: GuardarFlayerInputs = {
        ...dataBdValidada,
        imagen_url: urlImagenFinal, // URL pública para mostrar en el front
        public_id: fileKey          // Guardamos la Key de R2 para poder borrarla/actualizarla después
    };

    const resultBdFlaser = await dataFlayer.postFlayer(dataImagenSubida);
    
    if (resultBdFlaser.code === 'POST_FLAYER_CREAR') {
        const returnData: FlayerData = {
            imagen_url: dataImagenSubida.imagen_url,
            descripcion: dataImagenSubida.descripcion,
            titulo: dataImagenSubida.titulo
        };


        const dataHistorial : HistorialInputs ={
                id_escuela :  dataBdValidada.id_escuela ,
                id_usuario :  dataBdValidada.id_usuario,
                modulo : "FLAYERS",
                accion : "CREAR",
                id_registro: Number(resultBdFlaser.data?.id),
                descripcion: `Se subio flayer : ${ dataBdValidada.titulo}`,
                datos: {
                    dataBdValidada
                } 
        };

        await registroHistorial( dataHistorial );

        return {
            error: false, 
            message: "Imagen subida Correctamente",
            data: returnData,
            code: "FLAYER_OK"
        };
    }

    return {
        error: true, 
        message: "Error en el servidor, subir flayer.",
        code: "ERROR_SERVIDOR"
    };
};

/**
 * Obtiene y procesa el listado de flayers destinados para el carrusel, 
 * evaluando la respuesta de la base de datos para retornar un estado de éxito, 
 * sin resultados o un error de servidor.
 * 
 * @async
 * @function getFlayers
 * @returns {Promise<TipadoData<FlayerDataResult[]>>} Una promesa que resuelve con un objeto de tipo `TipadoData`. 
 * Retorna éxito (`error: false`) con el arreglo de flayers si se encontraron, o un error (`error: true`) 
 * si no hay flayers disponibles o si ocurre un fallo en el servidor.
 * 
 * @example
 * const resultado = await getFlayers();
 * if (!resultado.error) {
 *   console.log("Flayers del carrusel:", resultado.data);
 * }
 */
const getFlayers = async (  ) =>{

     const resultGetFlayers = await dataFlayer.getFlayers();
       
     if ( resultGetFlayers.code === 'GET_FLAYERS_LISTED'){
          return {
               error : false, 
               message : "Flayers para el carrucel.",
               data : resultGetFlayers.data,
               code : "FLAYERS_OK"
          };
     };  

     if ( resultGetFlayers.code === 'NO_ACTIVE_GET_FLAYERS'){
          return {
               error : true, 
               message : "No se encotraron flayers para el carrucel.",
               code : "SIN_FLAYERS"
          };
     };

     return {
          error : true , 
          message :  "Error en el servidor, carrucel flayer.",
          code : "ERROR_SERVIDOR"
     };     
    
};


const getFlayerEscuela = async ( id : IDEscualInputs) =>{

     const validarId : IDEscualInputs = IDEscuelaSchema.parse( id );

     const resultGetFlayers = await dataFlayer.getFlayerEscuela( validarId.id_escuela );
   
     if ( resultGetFlayers.code === 'GET_FLAYERS_LISTED'){
          return {
               error : false, 
               message : "Flayers para el carrucel.",
               data : resultGetFlayers.data,
               code : "FLAYERS_OK"
          };
     };  

     if ( resultGetFlayers.code === 'NO_ACTIVE_GET_FLAYERS'){
          return {
               error : true, 
               message : "No se encotraron flayers para el carrucel.",
               code : "SIN_FLAYERS"
          };
     };

     return {
          error : true , 
          message :  "Error en el servidor, carrucel flayer.",
          code : "ERROR_SERVIDOR   "
     };   

};


const eliminarFlayer = async ( data : EliminarFlayerInputs ) =>{

     const validarData : EliminarFlayerInputs = EliminarFlayerSchema.parse( data );

     const urlFlayer = await dataFlayer.getUrlFlayer( validarData.id_flayer );
     //console.log(urlFlayer)
     if ( urlFlayer.code === 'URL_FLAYER_NO_EXISTE'){
          return {
               error : true, 
               message : "No se encontró parámetros de la imagen para eliminar.",
               code : "ERROR_EN_BORRAR_FLAYER"
          };
     };

     if ( urlFlayer.code === 'URL_FLAYER_EXISTE' && urlFlayer.data?.imagen_url ){
          await eliminarImagenR2(urlFlayer.data?.imagen_url);
          await dataFlayer.eliminarFlayerDb(validarData.id_flayer);
          return {
               error: false,
               message: "Flyer eliminado correctamente",
               code: "SUCCESS"
          };          
     };

     return {
          error : true , 
          message :  "Error en el servidor, eLINAR  flayer.",
          code : "ERROR_SERVIDOR"
     };       


};

export const  method = {
     postFlayer : tryCatchDatos( postFlayer ),
     getFlayers : tryCatchDatos( getFlayers ),
     getFlayerEscuela : tryCatchDatos( getFlayerEscuela),
     eliminarFlayer : tryCatchDatos( eliminarFlayer),
};