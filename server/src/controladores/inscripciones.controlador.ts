import { Request, Response } from "express";

// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────
import { method as inscripcionesData } from "../data/inscripciones.data";
// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatch } from "../utils/tryCatch";
import { enviarResponseError } from "../utils/responseError";
import { enviarResponse } from "../utils/response";

// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { InscripcionInputs, InscripcionSchema } from "../squemas/inscripciones";
import { CodigoEstadoHTTP } from "../tipados/generico";


const inscripcion = async( req : Request , res : Response ) =>{
    const estado : string = 'activos';
    const { id_escuela , id_plan , dni_alumno ,
            fecha_inicio, fecha_fin,
            monto , clases_asignadas_inscritas , meses_asignados_inscritos
          } = req.body;

        
    const validacionInscripcion : InscripcionInputs = InscripcionSchema.parse({
        id_plan , id_escuela , dni_alumno , fecha_inicio , fecha_fin,
        monto , clases_asignadas_inscritas , meses_asignados_inscritos, estado
    }); 
   
    const inscVigente = await inscripcionesData.verificacion({dni_alumno, id_escuela , estado});

    if ( inscVigente.code === "INSCRIPCION_NO_EXISTE") {
      const resultInscripcion = await inscripcionesData.alta(validacionInscripcion);

        if ( resultInscripcion.code === "INSCRIPCIONES_CREAR"){
            return await enviarResponse(
                res,
                CodigoEstadoHTTP.OK,
                `EL alumno ${ dni_alumno }, registro existoso`,
                resultInscripcion.data,
                undefined,
                resultInscripcion.code
            );
        }

    }else{
        return enviarResponseError(
            res,
            CodigoEstadoHTTP.CONFLICTO,
            `El alumno : ${ dni_alumno }, ya esta inscripto`
        );
    };

};


export const method = {
    inscripcion    : tryCatch( inscripcion )
}
