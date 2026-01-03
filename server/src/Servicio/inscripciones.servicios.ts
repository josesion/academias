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
import {  InscripcionInputs, InscripcionSchema} from "../squemas/inscripciones"
import { TipadoData } from "../tipados/tipado.data";



const inscripcionServicios = async( data : InscripcionInputs)
: Promise<TipadoData<{ id_plan : number , dni_alumno : number }>> =>{

    const dataInscripcion : InscripcionInputs = InscripcionSchema.parse(data);
    const inscVigente = await inscripcionesData.verificacion(dataInscripcion);

    switch(inscVigente.code ){

        case "INSCRIPCION_NO_EXISTE" : {

            const resultadoInscripcion = await inscripcionesData.alta(dataInscripcion);

            if ( resultadoInscripcion.code === "INSCRIPCIONES_CREAR" ){
                return {
                    error : false,
                    message : `EL alumno : ${ dataInscripcion.dni_alumno }, registro existoso`,
                    data : resultadoInscripcion.data,
                    code : "INSCRIPCION_EXITOSA"
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
    inscripcionServicios : tryCatchDatos( inscripcionServicios)
};