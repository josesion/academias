// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────
import { method as inscripcionesData} from "../data/inscripciones.data";
// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import {  InscripcionInputs, InscripcionSchema} from "../squemas/inscripciones";
import { DetalleCajaInputs, DetalleCajaSchema } from "../squemas/cajas";

import { TipadoData } from "../tipados/tipado.data";




const inscripcionServiciosCaja = async( 
    dataInscripcion: InscripcionInputs, 
    dataDetalle: Omit<DetalleCajaInputs, 'referencia_id'>)
: Promise<TipadoData<{ id_inscripcion : number , dni_alumno : number }>> =>{

    const validInsc = InscripcionSchema.parse(dataInscripcion);
  
    const validCaja = DetalleCajaSchema.omit({ referencia_id: true }).parse(dataDetalle);
    
    const inscVigente = await inscripcionesData.verificacion( validInsc );
   
    switch(inscVigente.code ){

        case "INSCRIPCION_NO_EXISTE" : {

            const resultadoInscripcion = await inscripcionesData.inscripcionConPagoAlta(validInsc, validCaja);
            //console.log(resultadoInscripcion)
            if ( resultadoInscripcion.code === "TRANSACCION_OK" ){
                return {
                    error : false,
                    message : `EL alumno : ${ dataInscripcion.dni_alumno }, registro existoso`,
                    data : resultadoInscripcion.data,
                    code : "INSCRIPCION_EXITOSA"
                };
            };

            if ( resultadoInscripcion.code === "TRANSACCION_FALLIDA" ){
                return {
                    error : true,
                    message : `La inscripcion fallo por alguna razon `,
                    data : resultadoInscripcion.data,
                    code : "INSCRIPCION_FALLIDA"
                };
            };           
           
            return {
                error: true,
                message: "No se pudo crear la inscripción",
                code: "INSCRIPCION_CREACION_FALLIDA"
            };
        }; 

        case "INSCRIPCION_EXISTE"    :{
                return {
                    error: true,
                    message: `El alumno : ${dataInscripcion.dni_alumno} ya se encuentra inscripto.`,
                    code: "INSCRIPCION_EXISTENTE"
                };
        };

        default:{
            return {
                error : true,
                message : "No se logro verificar la inscripcion",
                code   :"NO_SE_LOGRO_VERIFICAR"
            };
        };    

    };
};

export const method = {
    inscripcionServiciosCaja : tryCatchDatos( inscripcionServiciosCaja)
};