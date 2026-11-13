import { tryCatchDatos } from "../utils/tryCatchBD";
import { subirImagenR2 } from "../utils/subirImagen";

import { GuardarImagenSchema, ImagenFlayerInputs } from "../squemas/flayer";
import { PostEscuelasInputs, PostEscuelaScjema, ModEscuelaSchema, ModEscuelasInputs,
         EstadoEscuelasInputs, EstadoEscuelaSchema , FiltroListadoEscualSchema, ListadoEscuelasInputs
 } from "../squemas/escuelas";
import { method as dataEscuela } from "../data/escuela.data";

import { EscuelaResumen,  RetornoEstado, EscuelaListadoRow } from "../data/escuela.data";
import { TipadoData } from "../tipados/tipado.data";
import { eliminarImagenR2 } from "../utils/subirImagen";


export interface EscuelaPost {
    imagen : ImagenFlayerInputs
    escuela : PostEscuelasInputs
};

export interface EscuelaModificarPost {
    imagen: ImagenFlayerInputs | null;
    escuela: ModEscuelasInputs;
    imagenMod : boolean;
}

/**
 * Crea una nueva escuela validando la imagen, la estructura de datos y la existencia
 * previa de la razón social/DNI en la base de datos antes de persistir el registro.
 *
 * @async
 * @function crearEscuela
 * @param {EscuelaPost} data - Objeto que contiene la imagen a subir y los datos de la escuela.
 * @returns {Promise<TipadoData<EscuelaResumen>>} Respuesta tipada del proceso con `error`, `message`, `code` y `data`.
 *
 * Flujo:
 * 1. Valida la imagen y el esquema de la escuela.
 * 2. Verifica que no exista la misma escuela en base de datos.
 * 3. Valida formato/tamaño de la imagen.
 * 4. Sube la imagen a R2.
 * 5. Persiste la escuela en la BD.
 */
const crearEscuela  = async (  data : EscuelaPost)
:Promise<TipadoData<EscuelaResumen>> =>{

    const { imagen, escuela } = data;

    const validarImagen : ImagenFlayerInputs = GuardarImagenSchema.parse(imagen);
    const validarEscuela : PostEscuelasInputs = PostEscuelaScjema.parse(escuela)


//////////////////////////////////////////////////
////    validacions q no existe el mismo dni , ni razon social ya enla base de datos
///////////////////////////////////////////////////
    const verificarcionBD = await dataEscuela.verificarRazonSocialEscuela( validarEscuela );

    if (verificarcionBD.code === "ESCUELA_EXISTE") {
        return {
            error: true,
            message: "EL dni  o Razon social  ya se encuentran registradas.",
            code:  "DNI_RAZON_SOCIAL_EXISTENTE",
        };
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
        fileKey = await subirImagenR2(validarImagen.buffer, validarImagen.nombre, validarImagen.tipo, "logo_escuela/");
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


    // -------------------- AHORA QUE SE CREO LA IMAGEN SE INICIA EL GUARADO DE LOS DATOS EN LA BASE DE DATOS DE LA ESCUELA
    const parametros : PostEscuelasInputs = {
        ...validarEscuela,
        urlImagen : urlImagenFinal,
        public_id: fileKey          // Guardamos la Key de R2 para poder borrarla/actualizarla después
    }


    const resultPostEscuela = await dataEscuela.altaEscuela( parametros);


    if ( resultPostEscuela.code === "ESCUELA_CREAR"){
        return {
            error : false,
            message : "Escuela agregada con exito.",
            data : resultPostEscuela.data,
            code : "ESCUELA_POST_OK"
        };
    };

 
     return {
          error : true , 
          message :  "Error en el servidor, post Escuela.",
          code : "ERROR_SERVIDOR"
     };       

};


const modificarEscuelaServicio = async (data: EscuelaModificarPost): Promise<TipadoData<EscuelaResumen>> => {
    const { imagen, escuela, imagenMod } = data;
    
    const validarEscuela: ModEscuelasInputs = ModEscuelaSchema.parse(escuela);

    if (imagen && imagenMod ) {

        const validarImagen: ImagenFlayerInputs = GuardarImagenSchema.parse(imagen);

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
        const sizeBytes = typeof validarImagen.size === "string"
            ? parseInt(validarImagen.size, 10)
            : validarImagen.size;

        if (sizeBytes > MAX_SIZE) {
            return {
                error: true,
                message: "La imagen no puede superar los 2 MB.",
                code: "TAMANO_IMAGEN_INVALIDO",
            };
        }

        const escuelaActual = await dataEscuela.localizarPublicIdEscuela(validarEscuela.id_escuela);
   
        if (escuelaActual.code === "ESCUELA_PUBLIC_ID_EXISTE" && escuelaActual.data?.public_id) {
            const urlVieja = escuelaActual.data.urlImagen
                ? escuelaActual.data.urlImagen
                : `${process.env.R2_PUBLIC_URL}/${escuelaActual.data.public_id}`;

            if (urlVieja) {
                await eliminarImagenR2(urlVieja);
            }
        }

        let fileKey: string;
        try {
            fileKey = await subirImagenR2(validarImagen.buffer, validarImagen.nombre, validarImagen.tipo, "logo_escuela/");
            
        } catch (error) {
            return {
                error: true,
                message: "No se pudo subir la imagen a Cloudflare R2.",
                code: "ERROR_SUBIR_IMAGEN",
            };
        }

        const urlImagenFinal = `${process.env.R2_PUBLIC_URL}/${fileKey}`;

        const escuelaModificada = await dataEscuela.modificarEscuela({
            ...validarEscuela,
            imagenMod : imagenMod,
            urlImagen: urlImagenFinal,
            public_id: fileKey,
        });

        if (escuelaModificada.code === "ESCUELA_MODIFICAR") {
            return {
                error: false,
                message: "Escuela actualizada con éxito.",
                data: escuelaModificada.data,
                code: "ESCUELA_UPDATE_OK",
            };
        }

        return {
            error: true,
            message: "Error en el servidor, modificar Escuela.",
            code: "ERROR_SERVIDOR",
        };
    }

    const escuelaModificada = await dataEscuela.modificarEscuela(validarEscuela);

    if (escuelaModificada.code === "ESCUELA_MODIFICAR") {
        return {
            error: false,
            message: "Escuela actualizada con éxito.",
            data: escuelaModificada.data,
            code: "ESCUELA_UPDATE_OK",
        };
    }

    return {
        error: true,
        message: "Error en el servidor, modificar Escuela.",
        code: "ERROR_SERVIDOR",
    };
};

const estadoEscuela = async ( data : EstadoEscuelasInputs )
:Promise<TipadoData< RetornoEstado>> =>{

    const validarEstado : EstadoEscuelasInputs = EstadoEscuelaSchema.parse( data );
    const resultEstado = await  dataEscuela.estadoEscuela( validarEstado );

    if ( resultEstado.code ===  'ESCUELA_MODIFICAR'){
        const mensajeEstado = validarEstado.estado === "activos" 
                            ? "Se dio de alta la Escuela" 
                            : "Se dio de baja la Escuela" ;   
                            
        return{
            error : false,
            message : mensajeEstado,
            data : resultEstado.data,
            code : "CAMBIO_ESTADO_ESCUELA"
        }                    
    };

    return {
        error: true,
        message: "Error en el servidor, estado Escuela.",
        code: "ERROR_SERVIDOR",
    };

};

const listaEscuela = async ( data :  ListadoEscuelasInputs )
:Promise<TipadoData<EscuelaListadoRow[]>> =>{

    const validarData : ListadoEscuelasInputs = FiltroListadoEscualSchema.parse( data ); 

    const { pagina, limit } = validarData;
    const offset = ( pagina -1 ) * Number(limit) ;

    const info = {
        ...validarData,
        offset : offset
    }

    const resultListado = await dataEscuela.listadoEscuelas(info, String(pagina));
 
    if ( resultListado.code === "LISTADO_ESCUELA_LISTED") {
        return {
            error: false,
            message: resultListado.message,
            data: resultListado.data,
            paginacion: resultListado.paginacion,
            code: "LISTADO_ESCUELA_OK"
        };
    }

    if ( resultListado.code === "NO_ACTIVE_LISTADO_ESCUELA") {
        return {
            error: true,
            message: "No hay escuelas para el filtro indicado.",
            code: "SIN_RESULTADOS_ESCUELA"
        };
    }

    return {
        error: true,
        message: "Error en el servidor, listar escuelas.",
        code: "ERROR_SERVIDOR"
    };

};

export const method = {
    crearEscuela : tryCatchDatos( crearEscuela),
    modificarEscuelaServicio : tryCatchDatos( modificarEscuelaServicio),
    estadoEscuela : tryCatchDatos( estadoEscuela ),
    listaEscuela : tryCatchDatos( listaEscuela )
}