import bcrypt from 'bcryptjs';
import { tryCatchDatos } from "../utils/tryCatchBD";


import { fechaHoy } from "../hooks/fecha";
import { listarEntidad } from "../hooks/funcionListar";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";
import { iudEntidadTransaction } from "../hooks/iudEntidadTRansaccion";

import { TipadoData } from "../tipados/tipado.data";
import { AlumnosInputs , ListaAlumnoInputs, AlumnoEscuelaInputs, EliminarAlumnoInputs , ListaAlumnoSinPaginacionInputs,
          AlumnosTransaccionInputs
} from "../squemas/alumno";
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
    
    const { dni, nombre, apellido, email, celular } = parametros ;    

    const sql : string =`INSERT INTO alumnos 
                        (dni_alumno, nombre, apellido, email, numero_celular)
                        VALUES (?, ?, ?, ?, ?);`;

    const valores: unknown[] = [dni, nombre, apellido, email, celular];
   
    return await iudEntidad({
        slqEntidad : sql,
        valores    : valores,
        entidad :"Alumno",
        metodo :"CREAR",
        datosRetorno : { dni, nombre, apellido, email, celular }
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

    const { dni, nombre, apellido, email, celular } = parametros ;  
    const sql: string =`UPDATE alumnos
                        SET 
                            nombre = ?,
                            apellido = ?,
                            email = ?,
                            numero_celular = ?
                        WHERE 
                            dni_alumno = ?;`;

    const valores : unknown[]  = [ nombre, apellido, email, celular, dni ];

    const datosADevolver: RetornoRegistroAlumno = { dni, nombre, apellido, email, celular };

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
    
    const sqlLista =    `select
                            alumnos.dni_alumno as Dni,
                            alumnos.apellido as Apellido,
                            alumnos.nombre as Nombre,
                            alumnos.email as Email,
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
    const likeDni = dni + "%";
    const sql : string = `select
                                alumnos.dni_alumno as Dni,
                                alumnos.apellido as Apellido,
                                alumnos.nombre as Nombre,
                                alumnos.email as Email,
                                alumnos.numero_celular as Celular
                            from alumnos
                                join alumnos_en_escuela on alumnos.dni_alumno = alumnos_en_escuela.dni_alumno
                            where
                                alumnos_en_escuela.estado = ?
                                and alumnos.dni_alumno like ?
                                and alumnos_en_escuela.id_escuela = ?
                            order by 
                                    alumnos.apellido
                            limit 15`;

    const valores : unknown[] = [estado , likeDni , escuela];

    return await listarEntidadSinPaginacion<DataAlumnosListadoSinPag>({
            slqListado: sql , 
            valores, 
            entidad : "Alumno",
            estado  : estado 
    });

};


export const verificarCorreoExistente = async ( email : string)
:Promise<TipadoData<{ id_usuario : string, correo :string }>> => {

  const sql : string = `SELECT id_usuario, correo FROM usuarios WHERE correo = ? OR usuario = ?;`;  
  const valores : unknown[] = [email, email];

  return await buscarExistenteEntidad({
        slqEntidad : sql,
        valores : valores,
        entidad : "USUARIO_CORREO"
  });

};



export const verificarCorreoExistente2 = async (email: string, dniActual?: number | string)
: Promise<TipadoData<{ dni_alumno: number, email: string }>> => {

  const sql: string = `
    SELECT dni_alumno, email 
    FROM alumnos 
    WHERE email = ? AND (? IS NULL OR dni_alumno != ?);
  `;  
  
  const valores: unknown[] = [email, dniActual ?? null, dniActual ?? null];

  return await buscarExistenteEntidad({
        slqEntidad: sql,
        valores: valores,
        entidad: "USUARIO_CORREO"
  });
};


export const altaAlumnoTransaccion = async (data: AlumnosTransaccionInputs) => {
    return await iudEntidadTransaction(async (conn) => {

        console.log(data)
        
        // 1. "Magia": Generar contraseña aleatoria de 6 dígitos
        const contrasenaPlano = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 2. Hashear la contraseña generada
        const hashedPassword = await bcrypt.hash(contrasenaPlano, 10);

        // 3. Insertar en la tabla 'usuarios'
        const sqlUsuario = `
            INSERT INTO usuarios (usuario, contrasena, nombre, apellido, celular, rol, correo, estado, id_escuela)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        
        const [resUsuario]: any = await conn.execute(sqlUsuario, [
            data.usuario || data.email, 
            hashedPassword, // Acá va la contraseña ya hasheada
            data.nombre,
            data.apellido,
            data.celular,
            data.rol || 'alumno',
            data.email,
            data.estado || 'activos',
            data.id_escuela
        ]);

        const idUsuarioGenerado = resUsuario.insertId;

        // 4. Insertar en la tabla 'alumnos'
        const sqlAlumno = `
            INSERT INTO alumnos (dni_alumno, nombre, apellido, email, numero_celular)
            VALUES (?, ?, ?, ?, ?);
        `;

        await conn.execute(sqlAlumno, [
            data.dni,
            data.nombre,
            data.apellido,
            data.email,
            data.celular
        ]);

        // (Opcional) retornar también la contraseña en plano por si tenés que mandarla por mail o WhatsApp:
        return {
            id_usuario: idUsuarioGenerado,
            dni: data.dni,
            email: data.email,
            contrasenaTemporal: contrasenaPlano // ¡Guarda si la devolvés acá para usarla en el correo!
        };
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
    listadoSinPaginacion : tryCatchDatos( listadoSinPaginacion),
    verificarCorreoExistente : tryCatchDatos( verificarCorreoExistente),
    verificarCorreoExistente2 : tryCatchDatos( verificarCorreoExistente2),
    altaAlumnoTransaccion : tryCatchDatos( altaAlumnoTransaccion),
};