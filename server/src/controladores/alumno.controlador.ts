import { Response , Request } from "express";

import { tryCatch } from "../utils/tryCatch";
import { method as dataAlumno } from "../data/alumno.data";
import { enviarResponse } from "../utils/response";


import {CrearAlumnoSchema, AlumnosInputs,
        listaAlumnosSchema, ListaAlumnoInputs,
} from "../squemas/alumno";


const altaAlumno = async( req :  Request , res : Response) =>{
    const alumnoData : AlumnosInputs = CrearAlumnoSchema.parse(req.body); 
    const existeAlumno = await dataAlumno.verAlumnoExistente(alumnoData.dni);
    if ( existeAlumno.error === false ){ // se econtro entonces se inscribe a la escuela
        // existe el alumno
        const inscripcion = await dataAlumno.registroAlumnoEscuela({ dni : alumnoData.dni  , id_escuela : alumnoData.id_escuela});
        if ( inscripcion.error === false && inscripcion.code === "STUDENT_ENROLLED") 
        return enviarResponse( res, 200 ,  inscripcion.message , inscripcion.data , undefined , inscripcion.code);
    }else{// no se concontro asi q se agrega y luego se inscribe 
        const registar = await dataAlumno.registarAlumno(alumnoData);
        if (registar.error === false && registar.code === "ALUMNO_CREATED" ){
            // una vez creada se inscribe a la escuela el alumno 
            const inscripcion = await dataAlumno.registroAlumnoEscuela({ dni : alumnoData.dni  , id_escuela : alumnoData.id_escuela});
            if ( inscripcion.error === false && inscripcion.code === "STUDENT_ENROLLED") 
            return enviarResponse( res, 200 ,  inscripcion.message , inscripcion.data , undefined , inscripcion.code);
        }
    }
};

const modAlumno = async( req : Request, res : Response) =>{

    const { dni , id_escuela} = req.params;
    const { nombre , apellido, celular } = req.body;

    const datoAlumno = { 
        dni : dni ,
        nombre : nombre ,
        apellido : apellido ,
        celular  : String(celular),
        id_escuela : Number(id_escuela)
    } 

    const alumnoData : AlumnosInputs = CrearAlumnoSchema.parse(datoAlumno);
    const resultado  = await dataAlumno.modAlumno( alumnoData );
    if ( resultado.error === false &&  resultado.code === "ALUMNO_MODIFICATION")
    return  enviarResponse(res , 200, resultado.message, resultado.data , undefined , resultado.code);    
}

const listarAlumno = async( req: Request  , res : Response) =>{
    const { estado , dni , apellido , limit , pagina, escuela } = req.query;
    const offset = ( Number(pagina) -1 ) * Number(limit) ;
    const listadoVerificado : ListaAlumnoInputs = listaAlumnosSchema.parse({
            estado , dni , apellido , escuela : Number(escuela) ,limit : Number(limit) , offset : Number(offset)});
    const listado = await dataAlumno.listaAlumnos(listadoVerificado , Number(pagina));  
    return enviarResponse( res , 200 , listado.message , listado.data , listado.paginacion , listado.code );
}

export const  method ={
    altaAlumno   : tryCatch( altaAlumno ),
    modAlumno    : tryCatch( modAlumno ),
    listarAlumno : tryCatch( listarAlumno )
}