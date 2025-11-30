import { Response , Request } from "express";
import { tryCatch } from "../utils/tryCatch";
import { fechaHoy } from "../hooks/fecha";
import { enviarResponse } from "../utils/response";
import { enviarResponseError } from "../utils/responseError";
import { method as dataProfesores } from "../data/profesores.data";

// Typados
import { CodigoEstadoHTTP } from "../tipados/generico";
import { ProfesorServicioCode } from "../tipados/profesores.data";

import { ProfesoresGlobales } from "../tipados/profesores.data";
import { CrearProfesorSchema , CrearProfesorEscuelaSchema, ModProfesoresSchema, EstadoProfesorSchema, ListaProfeUsuariosSchema,
         ProfesorInputs , ProfesorEscuelaInputs , ModProfesorInputs , EstadoProfesorInputs,
         ListadoProfeInputs
} from "../squemas/profesores"; 


/**
 * @function altaProfesores
 * @description Da de alta un nuevo profesor. Si el profesor ya existe globalmente, lo asocia con la escuela correspondiente.
 * @route POST /profesores
 * @param {Request} req - Objeto Request de Express con los datos del profesor en `body`
 * @param {Response} res - Objeto Response de Express
 * @returns {Promise<Response>} Respuesta HTTP con el resultado del alta o un error si ya existe.
 */

const altaProfesores = async( req : Request , res : Response ) => {
    const { dni , nombre , apellido , celular , id_escuela} = req.body ;

    const dataEntrada = {
            dni       : dni ,
            nombre    : nombre,
            apellido  : apellido,
            celular   : celular,

            fecha_creacion : fechaHoy(), 
            fecha_baja : null,
            id_escuela : id_escuela,
            
            estado : "activos"
    }

    const profesorGlobal : ProfesorInputs = CrearProfesorSchema.parse( dataEntrada );

    let dniProfesor : string = "0" ; 
    const existeProfeGlobal = await dataProfesores.verProfesor(dataEntrada.dni);

    if ( existeProfeGlobal.code === "PROFESOR_NO_EXISTE" ) {
        // no existe se crea el profesor global 
        const crearProfesorGlobal = await dataProfesores.altaProfesores( profesorGlobal );

        if ( crearProfesorGlobal.code === "PROFESORES_ALTA" ){
            const profesorCreado = crearProfesorGlobal.data as ProfesoresGlobales ;
            dniProfesor  = profesorCreado.dni
        
        }
    }else  if (  existeProfeGlobal.code === "PROFESOR_EXISTE"  ) {
                const profesorExistente  = existeProfeGlobal.data  as ProfesoresGlobales;   
                dniProfesor = profesorExistente.dni ;
            }

    const profesoresEscuela : ProfesorEscuelaInputs = CrearProfesorEscuelaSchema.parse( {  ...dataEntrada, dni : dniProfesor,})
    const existeProfesorEscuela = await dataProfesores.verProfesorEscuela({ dni : profesoresEscuela.dni , id_escuela : profesoresEscuela.id_escuela});

    if ( existeProfesorEscuela.code === "PROFESORESCUELA_NO_EXISTE") {
    
        const crearProfesorEscuela = await dataProfesores.altaProfesoresEscuela( profesoresEscuela );

        if ( crearProfesorEscuela.code === "PROFESORESCUELA_ALTA"){
            return enviarResponse(
                res,
                CodigoEstadoHTTP.CREADO,
                crearProfesorEscuela.message,
                crearProfesorEscuela.data,
                undefined,
                crearProfesorEscuela.code
            );
        }

    }else if ( existeProfesorEscuela.code === "PROFESORESCUELA_EXISTE"  ) {
    
        return enviarResponseError(
                    res, 
                    CodigoEstadoHTTP.CONFLICTO , 
                    "Profesor ya esta en Academia" ,
                    ProfesorServicioCode.PROFESOR_ESCUELA_ALREADY_EXISTS
               );
    }  
  
};

/**
 * @function modProfesores
 * @description Modifica los datos personales de un profesor (nombre, apellido, celular) en base a su DNI.
 * @route PUT /profesores/:dni/:id_escuela
 * @param {Request} req - Objeto Request de Express con `params` y `body` del profesor
 * @param {Response} res - Objeto Response de Express
 * @returns {Promise<Response>} Respuesta HTTP con el resultado de la modificación
 */

const modProfesores = async ( req : Request , res : Response )  => {

    const {dni , id_escuela} = req.params;
    const { nombre , apellido , celular} = req.body ;

    const dataMod = {
        dni         : dni, 
        id_escuela  : id_escuela,
        nombre      : nombre,    
        apellido    : apellido ,
        celular     : celular
    };
    
    const datosProfesor : ModProfesorInputs = ModProfesoresSchema.parse( dataMod );
    const modProfesor  = await dataProfesores.modProfesores( datosProfesor );

    if ( modProfesor.code === "PROFESORESCUELA_MODIFICAR"){
        return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            modProfesor.message,
            modProfesor.data,
            undefined,
            modProfesor.code
        );
    }
};

/**
 * @function estadoProfesor
 * @description Cambia el estado de un profesor (activo/inactivo). Se usa para bajas o reactivaciones.
 * @route PATCH /profesores/estado/:dni/:id_escuela/:estado
 * @param {Request} req - Objeto Request con los parámetros del profesor
 * @param {Response} res - Objeto Response de Express
 * @returns {Promise<Response>} Respuesta con mensaje de baja o reactivación
 */

const estadoProfesor = async ( req : Request , res : Response ) => {
 
    const {dni , id_escuela , estado} = req.params ;
    const data = {dni : dni , id_escuela : Number(id_escuela) , estado : estado };


    const estadoProfesorData : EstadoProfesorInputs = EstadoProfesorSchema.parse(data);
   
    const estadoProfe = await dataProfesores.estadoProfesor(estadoProfesorData);

    if ( estadoProfe.error === false) {
        switch (estadoProfe.code) {
            case "PROFESORESCUELA_ELIMINAR":
            return enviarResponse(res, CodigoEstadoHTTP.OK, "Profesor dado de baja", estadoProfe.data, undefined, estadoProfe.code);

            case "PROFESORESCUELA_ALTA":
            return enviarResponse(res, CodigoEstadoHTTP.OK, "Profesor reactivado", estadoProfe.data, undefined, estadoProfe.code);
        }  
    }
};

/**
 * @function listadoProfesores
 * @description Devuelve un listado paginado de profesores según filtros (dni, apellido, estado, escuela).
 * @route GET /profesores?dni=&apellido=&estado=&escuela=&limit=&pagina=
 * @param {Request} req - Objeto Request con filtros en `query`
 * @param {Response} res - Objeto Response
 * @returns {Promise<Response>} Respuesta con los profesores listados o error si no hay resultados
 */


const listadoProfesores = async( req : Request , res : Response ) => {

    const { dni , apellido , estado , escuela , limit , pagina} = req.query;  

    const offset = ( Number(pagina) -1 ) * Number(limit) ;

    const listadoParams : ListadoProfeInputs = ListaProfeUsuariosSchema.parse({
        dni : String(dni),
        apellido : String(apellido),
        estado : String(estado) as 'activos' | 'inactivos',
        id_escuela : Number(escuela),
        limit  : Number(limit),
        offset : Number(offset)
    });


 
    const listado = await dataProfesores.listadoProfesores( listadoParams , Number(pagina) );

    if ( listado.error === false ) {
        return enviarResponse(
            res,
            CodigoEstadoHTTP.OK,
            listado.message,
            listado.data,
            listado.paginacion,
            listado.code
        );
    } else {
        return enviarResponseError(
            res,
            CodigoEstadoHTTP.NO_ENCONTRADO,
            listado.message  || 'Error al obtener el listado de planes.' ,
            listado.code
        );
    }
};



export const method = {
    alta    : tryCatch( altaProfesores ),
    mod     : tryCatch( modProfesores ),
    estado  : tryCatch( estadoProfesor ), 
    listado : tryCatch( listadoProfesores)
}