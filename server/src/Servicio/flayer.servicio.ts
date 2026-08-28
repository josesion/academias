import { tryCatchDatos } from "../utils/tryCatchBD";
import { subirImagen } from "../utils/subirImagen";
import { method as dataFlayer } from "../data/flayer.data"; 

import { TipadoData } from "../tipados/tipado.data";
import { GuardarFlayerInputs, ImagenFlayerInputs , GuardarFlayerSchema, GuardarImagenSchema } from "../squemas/flayer";


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
const postFlayer  = async ( data : DataPost )
:Promise<TipadoData<FlayerData>> =>{

     const {  imagen, dataTabla} = data;

     const validarImagen : ImagenFlayerInputs =  GuardarImagenSchema.parse( imagen ); 
     const dataBdValidada : GuardarFlayerInputs = GuardarFlayerSchema.parse( dataTabla );

     const cantidadFlayersEscuela = await dataFlayer.verificarPlan( dataBdValidada.id_escuela );

     if ( cantidadFlayersEscuela.code === "CONTADOR_FLAYES_EXISTE" ){
          const cantidadFlayer = cantidadFlayersEscuela.data?.cantidad_flayers ? cantidadFlayersEscuela.data.cantidad_flayers : 0;
  
          if (dataBdValidada.plan <= cantidadFlayer){
               return{
                    error : true, 
                    message : "Superlo el limite de su plan.",
                    code : "SIN_PERMISOS"
               };
          };
     };

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
     };

     const MAX_SIZE = 2 * 1024 * 1024;

     if (validarImagen.size > MAX_SIZE) {
          return {
               error: true,
               message: "La imagen no puede superar los 2 MB.",
               code: "TAMANO_IMAGEN_INVALIDO",
          };
     };     


     const resultSubirImagen = await subirImagen( validarImagen.buffer );
   
     if (!resultSubirImagen.secure_url || !resultSubirImagen.public_id) {
          return {
               error: true,
               message: "No se pudo obtener la información de la imagen desde Cloudinary.",
               code: "ERROR_SUBIR_IMAGEN",
          };
     };
 
     const dataImagenSubida : GuardarFlayerInputs = {
          ...dataBdValidada,
          imagen_url : resultSubirImagen.secure_url,
          public_id  : resultSubirImagen.public_id
     };

     const resultBdFlaser = await  dataFlayer.postFlayer( dataImagenSubida);
     if (resultBdFlaser.code === 'POST_FLAYER_CREAR' ){
          // aca envio el mensaje  de todo bien al controlador 
          const returnData : FlayerData = {
             imagen_url : dataImagenSubida.imagen_url,
             descripcion :  dataImagenSubida.descripcion,
             titulo  : dataImagenSubida.titulo
          }

          return {
               error : false, 
               message : "Imagen subida Correctamente",
               data : returnData,
               code : "FLAYER_OK"
          };
     };

     return {
          error : true , 
          message :  "Error en el servidor, subir flayer.",
          code : "ERROR_SERVIDOR   "
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
          code : "ERROR_SERVIDOR   "
     };     
    
};

export const  method = {
     postFlayer : tryCatchDatos( postFlayer ),
     getFlayers : tryCatchDatos( getFlayers ),
};