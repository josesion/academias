
import { tryCatchDatos } from "../utils/tryCatchBD";


import { fechaHoy } from "../hooks/fecha";
import { listarEntidad } from "../hooks/funcionListar";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";


import { TipadoData } from "../tipados/tipado.data";
import { AlumnosInputs , ListaAlumnoInputs, AlumnoEscuelaInputs, EliminarAlumnoInputs , ListaAlumnoSinPaginacionInputs} from "../squemas/alumno";
import { RetornoRegistroAlumno, DataAlumnosListado , RetornoModAlumno, RetornoEliminaciom,
         RetornoVerAlumnoExistente, RetornoIncripcionAlumnoEscuela , DataAlumnosListadoSinPag
} from "../tipados/alumno.data";


// verifico si el alumno esta ya en base de datos
const verAlumnoExistente = async( dni : string) 
: Promise<TipadoData<RetornoVerAlumnoExistente | undefined > >  =>{

    const dniNumber = Number(dni);
    const slq : string =`select 
                            dni_alumno 
                         from 
                            alumnos 
                         where 
                            alumnos.dni_alumno = ?;`;
    const valor : unknown[] = [dniNumber];


    return await buscarExistenteEntidad<RetornoVerAlumnoExistente>({
        slqEntidad : slq,
        valores    : valor,
        entidad :"Alumno",

    });

};


const verAlumnoEscuelaExistente = async( dni : string , id_escuela : number) 
: Promise<TipadoData<RetornoVerAlumnoExistente | undefined > >  =>{

    const dniNumber = Number(dni);
    const slq : string =`select 
                                dni_alumno 
                         from 
                                alumnos_en_escuela
                         where 
	                            dni_alumno = ?
                         and 
                                id_escuela = ? ;`;

    const valor : unknown[] = [dniNumber , id_escuela];


    return await buscarExistenteEntidad<RetornoVerAlumnoExistente>({
        slqEntidad : slq,
        valores    : valor,
        entidad :"AlumnoEscuela",
    });

};




const registarAlumno  = async( parametros : AlumnosInputs)
 : Promise<TipadoData<RetornoRegistroAlumno>> =>{

    const {dni , nombre ,apellido ,celular } = parametros ;     

    const sql : string =`INSERT INTO alumnos 
                        (dni_alumno, nombre, apellido, numero_celular )
                        VALUES ( ? , ? , ? , ? );`;

    const valores: unknown[] = [dni , nombre , apellido , celular ];
   
    return await iudEntidad({
        slqEntidad : sql,
        valores    : valores,
        entidad :"Alumno",
        metodo :"CREAR",
        datosRetorno : { dni, nombre, apellido , celular}
    });

};




const registroAlumnoEscuela = async( parametros : AlumnoEscuelaInputs ) 
: Promise<TipadoData<RetornoIncripcionAlumnoEscuela>> =>{

    const { dni ,  id_escuela} = parametros;
    const fechaFormateada = fechaHoy();
    const dniNumber = Number(dni);

    const  sql : string = `INSERT INTO alumnos_en_escuela 
                                (dni_alumno, id_escuela, fecha_alta_escuela) 
                           VALUES ( ? , ? , ? )`;

    const valores  : unknown[] = [dniNumber , id_escuela , fechaFormateada ];

    return await iudEntidad({
        slqEntidad : sql,
        valores    : valores,
        entidad :"Alumno",
        metodo :"ALTA",
        datosRetorno : { dni , id_escuela }
    })

}

const modAlumno = async( parametros : AlumnosInputs)  : Promise<TipadoData<RetornoModAlumno>> =>{

    const {dni , nombre ,apellido ,celular  } = parametros ;  
    const sql: string =`UPDATE alumnos
                        SET 
                            nombre = ? ,
                            apellido = ? ,
                            numero_celular = ?
                        WHERE 
                            dni_alumno = ? ;`;

    const valores : unknown[]  = [ nombre , apellido , celular , dni];

    const datosADevolver: RetornoRegistroAlumno = { dni, nombre, apellido , celular};

    return await iudEntidad({
        slqEntidad : sql,
        valores    : valores,
        entidad :"Alumno",
        metodo :"MODIFICAR",
        datosRetorno : datosADevolver
    })

};

const eliminarAlumno = async( parametros : EliminarAlumnoInputs) 
 : Promise<TipadoData<RetornoEliminaciom>>=>{
    const {dni , id_escuela, estado} = parametros;  
    const sql =`update alumnos_en_escuela
                set 
	                estado = ?
                where 
	            dni_alumno = ? and id_escuela = ?;`;
    const valores = [estado, dni , id_escuela];
    return await iudEntidad({
        slqEntidad : sql,
        valores    : valores,
        entidad :"Alumno",
        metodo :"ELIMINAR",
        datosRetorno : { dni }
    });
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
                            count(*) over() as total_registros
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
    
    const valores: unknown[] = [ estado ,likeDni , likeApellido , escuela];

     return await listarEntidad<DataAlumnosListado>(
        {
            slqListado: sqlLista , 
            valores, 
            limit, 
            pagina ,
            entidad : "Alumno",
            estado  : estado 
        })
   

};

const listadoSinPaginacion = async( parametros : ListaAlumnoSinPaginacionInputs) 
:Promise<TipadoData<DataAlumnosListadoSinPag[]>> => {
    const {dni ,escuela ,estado} = parametros ;

    const sql : string = `select
                                alumnos.dni_alumno as Dni,
                                alumnos.apellido as Apellido,
                                alumnos.nombre as Nombre,
                                alumnos.numero_celular as Celular
                            from alumnos
                                join alumnos_en_escuela on alumnos.dni_alumno = alumnos_en_escuela.dni_alumno
                            where
                                alumnos_en_escuela.estado = ?
                                and alumnos.dni_alumno like ?
                                and alumnos_en_escuela.id_escuela = ?`;

    const valores : unknown[] = [estado , dni , escuela];

    return await listarEntidadSinPaginacion<DataAlumnosListadoSinPag>({
            slqListado: sql , 
            valores, 
            entidad : "Alumno",
            estado  : estado 
    });

};


export const  method = {
    verAlumnoExistente : tryCatchDatos( verAlumnoExistente ),
    verAlumnoEscuelaExistente : tryCatchDatos( verAlumnoEscuelaExistente ),
    registarAlumno :    tryCatchDatos( registarAlumno , "Alumno" ),
    registroAlumnoEscuela : tryCatchDatos ( registroAlumnoEscuela, "Inscripcion" , "femenino"),
    modAlumno      :    tryCatchDatos( modAlumno ),
    eliminarAlumno :    tryCatchDatos ( eliminarAlumno),
    listaAlumnos   :    tryCatchDatos( listaAlumnos ),
    listadoSinPaginacion : tryCatchDatos( listadoSinPaginacion)
};