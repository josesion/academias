/**
 * @fileoverview Controlador Express para la Gestión CRUD (ABML) de la entidad Alumno.
 * @module controllers/alumno.controller
 * @description Contiene los manejadores de rutas para Alta, Baja, Modificación y Listado de alumnos.
 * Utiliza validación de esquemas (Zod) y wrappers de manejo de errores (`tryCatch`).
 */
import { Response , Request } from "express";

import { tryCatch } from "../utils/tryCatch";
import { method as dataAlumno } from "../data/alumno.data";
import { enviarResponse } from "../utils/response";


import { CodigoEstadoHTTP } from "../tipados/generico";
import { AlumnoServioCode,RetornoVerAlumnoExistente,RetornoRegistroAlumno } from "../tipados/alumno.data"; 
import {CrearAlumnoSchema, AlumnosInputs,
        listaAlumnosSchema, ListaAlumnoInputs,
        EliminarAlumnoEscuelaSchema, EliminarAlumnoInputs

} from "../squemas/alumno";


const altaAlumno = async( req :  Request , res : Response) =>{
    let dniCapturado: number = 0 ;
    const { id_escuela} =req.body;
    // 1. Validación de entrada
    const alumnoData : AlumnosInputs = CrearAlumnoSchema.parse(req.body); 
    
    // 2. Verifica si el alumno ya existe en el sistema global
    const existeAlumno = await dataAlumno.verAlumnoExistente(alumnoData.dni);

    if (existeAlumno.error === true && existeAlumno.data && existeAlumno.code === AlumnoServioCode.ALUMNO_ALREADY_EXISTS) {
       const alumnoExistente = existeAlumno.data  as RetornoVerAlumnoExistente ;
        dniCapturado = alumnoExistente.dni_alumno ;
    } else{
           // 3. Si no existe, crea el alumno en el sistema global  
       const nuevoAlumno = await dataAlumno.registarAlumno(alumnoData);
       console.log(nuevoAlumno);
       if (nuevoAlumno.error === false && nuevoAlumno.data && nuevoAlumno.code === AlumnoServioCode.ALUMNO_CREATED) {
            const dniAlumnoCreado = nuevoAlumno.data as RetornoRegistroAlumno  ;
            dniCapturado = Number(dniAlumnoCreado.dni) ;
          } else {
            return enviarResponse(res ,
                                  CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
                                  nuevoAlumno.message, 
                                  undefined , 
                                  undefined , 
                                  AlumnoServioCode.CREATION_FAILED
                                );    
          }

    } ;
    
   // 4. Verifica si el alumno ya está inscrito en la escuela específica    
    const existeAlumnoEscuela = await dataAlumno.verAlumnoEscuelaExistente(String(dniCapturado) , Number(id_escuela) );
    if (existeAlumnoEscuela.error === true && existeAlumnoEscuela.data && existeAlumnoEscuela.code === AlumnoServioCode.ALUMNO_ESCHOOL_ALREADY_EXISTS) {
        return enviarResponse(res ,
                              CodigoEstadoHTTP.CONFLICTO,
                              'El alumno ya está inscrito en esta escuela.', 
                              undefined , 
                              undefined , 
                              AlumnoServioCode.ALUMNO_ESCHOOL_ALREADY_EXISTS
                            );          
    }
    // 5. Si no está inscrito, procede a inscribir al alumno en la escuela
    const inscripcionAlumno = await dataAlumno.registroAlumnoEscuela({ dni: String(dniCapturado) , id_escuela : Number(id_escuela) });
    if (inscripcionAlumno.error === false && inscripcionAlumno.data ) {
         return enviarResponse(res ,
                              CodigoEstadoHTTP.CREADO,
                              inscripcionAlumno.message, 
                              inscripcionAlumno.data , 
                              undefined , 
                              AlumnoServioCode.ALUMNO_CREATED
                            );           
    }    
};


const modAlumno = async( req : Request, res : Response) =>{

    const { dni , id_escuela} = req.params;
    const { nombre , apellido, celular } = req.body;

    // 1. Construcción del objeto de datos para la validación
    const datoAlumno = { 
        dni : dni ,
        nombre : nombre ,
        apellido : apellido ,
        celular  : String(celular),
        id_escuela : Number(id_escuela)
    } 

    // 2. Validación de entrada (reutilizando el schema de creación)
    const alumnoData : AlumnosInputs = CrearAlumnoSchema.parse(datoAlumno);
    
    // 3. Ejecución de la lógica de modificación
    const resultado  = await dataAlumno.modAlumno( alumnoData );

    if ( resultado.error === false &&  resultado.code === AlumnoServioCode.USER_ALUMNO_UPDATE )
    return  enviarResponse(res , 200, resultado.message, resultado.data , undefined , resultado.code);    
}


const borrarAlumno = async( req : Request , res : Response) =>{
    const { dni , id_escuela, estado  } = req.params;
    
    // 1. Validación de entrada
    const alumnoData : EliminarAlumnoInputs = EliminarAlumnoEscuelaSchema.parse({dni, id_escuela: Number(id_escuela), estado});
    
    // 2. Ejecución de la lógica de eliminación
    const respuesta  = await dataAlumno.eliminarAlumno(alumnoData);
    console.log(respuesta);
    if ( respuesta.error === false && respuesta.code === AlumnoServioCode.ALUMNO_DELETE )
        return enviarResponse( res , 200 , respuesta.message , respuesta.data ,undefined , respuesta.code );
};



const listarAlumno = async( req: Request  , res : Response) =>{
    const { estado , dni , apellido , limit , pagina, escuela } = req.query;
    
    // 1. Cálculo del offset para la paginación (0-based index)
    const offset = ( Number(pagina) -1 ) * Number(limit) ;
    
    // 2. Validación de los parámetros de listado
    const listadoVerificado : ListaAlumnoInputs = listaAlumnosSchema.parse({
            estado , dni , apellido , escuela : Number(escuela) ,limit : Number(limit) , offset : Number(offset)});
    
    // 3. Ejecución de la lógica de listado
    const listado = await dataAlumno.listaAlumnos(listadoVerificado , Number(pagina));  
    
    // 4. Envío de la respuesta con datos y paginación
    return enviarResponse( res , CodigoEstadoHTTP.OK , listado.message , listado.data , listado.paginacion , listado.code );
};

export const  method ={
    altaAlumno   : tryCatch( altaAlumno ),
    modAlumno    : tryCatch( modAlumno ),
    borrarAlumno : tryCatch( borrarAlumno),
    listarAlumno : tryCatch( listarAlumno )
}