import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataSuscripcion }  from "../data/suscripcion.escuela.data";
import {
    SuscripcionInputs, SuscripcionSchema,
    filtrosSuscripcionesSchema, FiltrosSuscripcionesInputs, FiltrosSuscripciones
 } from "../squemas/suscripciones.escuela";
import { TipadoData } from "../tipados/tipado.data";
import { SuscripcionEscuelaDto } from "../data/suscripcion.escuela.data";



const postSuscripcion = async ( data : SuscripcionInputs)
:Promise<TipadoData< {}>> =>{

    const dataValidada : SuscripcionInputs = SuscripcionSchema.parse( data );

    const verificarSuspcripcion = await  dataSuscripcion.verificarSuscripcion( dataValidada.id_escuela );

    if ( verificarSuspcripcion.code === 'SUSPCRIPCION_NO_EXISTE'){

        const resultSuscripcion = await dataSuscripcion.postSuscripcion(data);
        
        if ( resultSuscripcion.code === 'SUSCRIPCION_CREAR' ){
            return {
                error : false,
                message : "Suscripcion creada con exito.",
                data : resultSuscripcion.data,
                code : "SUSCRIPCION_OK"
            };
        };
    };

    if ( verificarSuspcripcion.code === 'SUSPCRIPCION_EXISTE'){
        return {
            error : true, 
            message : "Esta escuela ya cuenta con una Suscripcion.",
            code : "SUSCRIPCION_ACTIVA"
        };
    };


    return{
        error : true, 
        message : "Error en el servidor , post suscripcion.",
        code : "ERROR_SERVIDOR"
    };  
};


const getSuspcripciones = async ( data : FiltrosSuscripcionesInputs  )
:Promise<TipadoData<SuscripcionEscuelaDto[]>> =>{

    const validarSusp : FiltrosSuscripciones = filtrosSuscripcionesSchema.parse(data);
    const { pagina, limit} = validarSusp
    const offset = ( pagina -1 ) * Number(limit) ;  

    const info = {
        ...validarSusp, offset : offset
    }

    const resultGetListado = await dataSuscripcion.getSuscripciones(info, String(validarSusp.pagina));
   
    if ( resultGetListado.code === 'LISTADO_SUSP_LISTED' ){
        return {
            error: false,
            message : "Listado de susp. ok.",
             data : resultGetListado.data,
             paginacion : resultGetListado.paginacion,
             code : "LISTADO_SUSP_OK"
        };
    };

    if ( resultGetListado.code === 'NO_ACTIVE_LISTADO_SUSP' ){
        return {
            error: true ,
            message : "Sin listado de susp.",
            code : "LISTADO_SUSP_EMPY"
        };
    };    
    
    return{
        error : true, 
        message : "Error en el servidor , get suscripcion.",
        code : "ERROR_SERVIDOR"
    }; 
}

export const method = {
    postSuscripcion : tryCatchDatos(  postSuscripcion ),
    getSuspcripciones : tryCatchDatos( getSuspcripciones ),
};