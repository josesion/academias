
import { tryCatchDatos } from "../utils/tryCatchBD";
import { iud, select } from "../utils/baseDatos";
import { ClientError } from "../utils/error";
import { fechaHoy } from "../hooks/fecha";


import { TipadoData } from "../tipados/tipado.data";
import { AlumnosInputs , ListaAlumnoInputs, AlumnoEscuelaInputs, EliminarAlumnoInputs } from "../squemas/alumno";
import {  RetornoRegistroAlumno, DataAlumnosListado , RetornoModAlumno, RetornoEliminaciom,
        RetornodAlumno, RetornoIncripcionAlumnoEscuela
} from "../tipados/alumno.data";
import { _promise } from "zod/v4/core/api.cjs";

// verifico si el alumno esta ya en base de datos
const verAlumnoExistente = async( dni : string) : Promise<TipadoData<RetornodAlumno | undefined > >  =>{
    const dniNumber = Number(dni);
    const slq =`select * from alumnos where alumnos.dni_alumno = ?;`;
    const valor = [dniNumber];
    const resultado = await select<RetornodAlumno>(slq, valor);

    if (resultado.length <= 0) {
        return {
             error: true,
                message: "Este alumno no está registrado en el sistema",
                data: undefined,
                code: "ALUMNO_NOT_FOUND",
                errorsDetails: undefined,
        };
    }

    return {
        error  : false,
        message : "Alumno encontrado en la base de datos.",
        data : resultado[0],
        code :"ALUMNO_",
        errorsDetails : undefined
    }
}

const registarAlumno  = async( parametros : AlumnosInputs) : Promise<TipadoData<RetornoRegistroAlumno>> =>{
const {dni , nombre ,apellido ,celular } = parametros ;     
    const sql =`INSERT INTO alumnos (dni_alumno, nombre, apellido, numero_celular )
                VALUES ( ? , ? , ? , ? );`;
    const valores = [dni , nombre , apellido , celular ];
    const resultado = await iud(sql , valores);

    if ( resultado.affectedRows <= 0 ) {throw new ClientError("No se logro crear el alumno", 500 ,"CREATION_FAILED" );}

    return {
        error  : false,
        message : " Alumno creado exitosamente",
        data : { dni , apellido , nombre},
        code :"ALUMNO_CREATED",
        errorsDetails : undefined
    }

}

const registroAlumnoEscuela = async( parametros : AlumnoEscuelaInputs ) : Promise<TipadoData<RetornoIncripcionAlumnoEscuela>> =>{
    const { dni ,  id_escuela} = parametros;
    const fechaFormateada = fechaHoy();
    const dniNumber = Number(dni);
    const  sql = `INSERT INTO alumnos_en_escuela (dni_alumno, id_escuela, fecha_alta_escuela) 
                    VALUES ( ? , ? , ? )`;
    const valores = [dniNumber , id_escuela , fechaFormateada ];
    const resultado = await iud( sql , valores);
    if ( resultado.affectedRows <= 0 ) throw new ClientError("No se logro realizar la inscripcion", 500);
        return {
        error  : false,
        message : "Incripcion Correcta ",
        data : { dni  , id_escuela},
        code :"STUDENT_ENROLLED",
        errorsDetails : undefined
    }

}

const modAlumno = async( parametros : AlumnosInputs)  : Promise<TipadoData<RetornoModAlumno>> =>{

    const {dni , nombre ,apellido ,celular  } = parametros ;  
    // const alumnoExistente = await verAlumnoExistente(dni);
    //     if (alumnoExistente.error === true) 
    //     throw new ClientError("Alumno no encontrado.", 404, "ALUMNO_NOT_FOUND");

    const sql =`UPDATE alumnos
                SET 
                    nombre = ? ,
                    apellido = ? ,
                    numero_celular = ?
                        WHERE 
                        dni_alumno = ? ;`;
    const valores = [ nombre , apellido , celular , dni];
    const resultado =await iud(sql , valores );
    if (resultado.affectedRows > 0) {
        return {
            error : false,
            message : "Modificación Correcta",
            data : { dni, nombre, apellido, celular },
            code :"ALUMNO_MODIFICATION",
            errorsDetails : undefined
        };
    }else{
        throw new ClientError("No se lorgro eliminar al alumno .", 409, "NO_CHANGE_MADE");
    }


};

const eliminarAlumno = async( parametros : EliminarAlumnoInputs)  : Promise<TipadoData<RetornoEliminaciom>>=>{
    const {dni , id_escuela, estado} = parametros;   
    const sql =`update alumnos_en_escuela
                set 
	                estado = ?
                where 
	            dni_alumno = ? and id_escuela = ?;`;
    const valores = [estado, dni , id_escuela];
    const resultado = await iud(sql, valores);
    if ( resultado.affectedRows > 0) {
        return {
            error : false,
            message : "Cambio de estado Correcto",
            data : { dni },
            code :"ALUMNO_DELETE",
            errorsDetails : undefined
        }; 
    }else{
        throw new ClientError("No se realizó ninguna eliminacion , el esatado es idénticos.", 409, "NO_CHANGE_MADE");
    }

};


const listaAlumnos = async( 
    params : ListaAlumnoInputs,
    pagina : string
) : Promise<TipadoData<DataAlumnosListado[]>>  =>{
    const { estado, dni , apellido ,limit , offset, escuela} = params ;
    const likeDni = dni + "%";
    const likeApellido = apellido + "%";
    

    const sqlLista =   `select
                            alumnos.dni_alumno as Dni,
                            alumnos.apellido as Apellido,
                            alumnos.nombre as Nombre,
                            alumnos.numero_celular as Celular,
                            count(*) over() as total_alumnos
                                from alumnos
                                join alumnos_en_escuela on alumnos.dni_alumno = alumnos_en_escuela.dni_alumno
                            where
                                alumnos_en_escuela.estado = ?
                                and alumnos.dni_alumno like ?
                                and alumnos.apellido like ?
                                and alumnos_en_escuela.id_escuela = ?
                                order by alumnos.dni_alumno
                                    limit ${limit}
                                    offset ${offset};`;
    
    const valores = [ estado ,likeDni , likeApellido , escuela];
    const resultado = await select<DataAlumnosListado>(sqlLista, valores);

    if ( resultado.length <= 0) {
        throw new ClientError(`No hay Alumnos ${estado}` , 200 ,  "NO_ACTIVE_ALUMN");
    }
    const totalPagina = Math.ceil( Number(resultado[0].total_alumnos) / limit);

    const dataAlumnos = resultado.map(alumno => {
        const { total_alumnos, ...alumnoData } = alumno as any; 
        return alumnoData;
    });

    return {
        error: false,
        message: `Alumnos listados ${estado}`,
        data: dataAlumnos,
        paginacion: {
            pagina: Number(pagina),
            limite: Number(limit),
            contadorPagina: totalPagina
        },
        code: "ALUMNOS_LISTED",
        errorsDetails: undefined
    };

}

export const  method = {
    verAlumnoExistente : tryCatchDatos( verAlumnoExistente ),
    registarAlumno :    tryCatchDatos( registarAlumno , "Alumno" ),
    registroAlumnoEscuela : tryCatchDatos ( registroAlumnoEscuela, "Inscripcion" , "femenino"),
    modAlumno      :    tryCatchDatos( modAlumno ),
    eliminarAlumno :    tryCatchDatos ( eliminarAlumno),
    listaAlumnos   :    tryCatchDatos( listaAlumnos )
};