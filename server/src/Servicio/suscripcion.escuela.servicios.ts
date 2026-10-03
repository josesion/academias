import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataSuscripcion }  from "../data/suscripcion.escuela.data";
import { SuscripcionInputs, SuscripcionSchema } from "../squemas/suscripciones.escuela";
import { TipadoData } from "../tipados/tipado.data";



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




export const method = {
    postSuscripcion : tryCatchDatos(  postSuscripcion ),
};