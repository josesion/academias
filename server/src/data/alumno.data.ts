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

// verifico si el alumno existe por email (cuando no tiene DNI)
const verAlumnoExistentePorEmail = async( email : string) 
: Promise<TipadoData<RetornoVerAlumnoExistente | undefined > >  =>{

    const slq : string =`select 
                            dni_alumno 
                         from 
                            alumnos 
                         where 
                            alumnos.email = ?;`;
    const valor : unknown[] = [email];


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
    const { estado, dni , email, apellido ,limit , offset, escuela} = params ;
    
    // Construir condiciones WHERE dinámicamente para evitar LIKE en BIGINT
    const condiciones: string[] = [
        "alumnos_en_escuela.estado = ?",
        "alumnos_en_escuela.id_escuela = ?"
    ];
    const valoresBase: unknown[] = [estado, escuela];

    if (dni && dni.trim() !== "") {
        condiciones.push("CAST(alumnos.dni_alumno AS CHAR) LIKE ?");
        valoresBase.push((dni || "") + "%");
    }

    if (email && email.trim() !== "") {
        condiciones.push("alumnos.email LIKE ?");
        valoresBase.push((email || "") + "%");
    }

    if (apellido && apellido.trim() !== "") {
        condiciones.push("alumnos.apellido LIKE ?");
        valoresBase.push(apellido + "%");
    }

    const sqlLista = `select
                            alumnos.dni_alumno as Dni,
                            alumnos.apellido as Apellido,
                            alumnos.nombre as Nombre,
                            alumnos.email as Email,
                            alumnos.numero_celular as Celular,
                            count(*) over() as total_registros
                                from alumnos
                                join alumnos_en_escuela on alumnos.dni_alumno = alumnos_en_escuela.dni_alumno
                            where
                                ${condiciones.join("\n                                and ")}
                                order by alumnos.dni_alumno
                                    limit ${limit}
                                    offset ${offset};`;
    
    const valores: unknown[] = valoresBase;

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
    const {dni , email, escuela ,estado} = parametros ;
    
    // Construir condiciones WHERE dinámicamente para evitar LIKE en BIGINT
    const condiciones: string[] = [
        "alumnos_en_escuela.estado = ?",
        "alumnos_en_escuela.id_escuela = ?"
    ];
    const valoresBase: unknown[] = [estado, escuela];

    if (dni && dni.trim() !== "") {
        condiciones.push("CAST(alumnos.dni_alumno AS CHAR) LIKE ?");
        valoresBase.push((dni || "") + "%");
    }

    if (email && email.trim() !== "") {
        condiciones.push("alumnos.email LIKE ?");
        valoresBase.push((email || "") + "%");
    }

    const sql : string = `select
                                alumnos.dni_alumno as Dni,
                                alumnos.apellido as Apellido,
                                alumnos.nombre as Nombre,
                                alumnos.email as Email,
                                alumnos.numero_celular as Celular
                            from alumnos
                                join alumnos_en_escuela on alumnos.dni_alumno = alumnos_en_escuela.dni_alumno
                            where
                                ${condiciones.join("\n                                and ")}
                            order by 
                                    alumnos.apellido
                            limit 15`;

    const valores : unknown[] = valoresBase;

    return await listarEntidadSinPaginacion<DataAlumnosListadoSinPag>({
            slqListado: sql , 
            valores, 
            entidad : "Alumno",
            estado  : estado 
    });

};


export const verificarCorreoExistente = async ( email : string)
:Promise<TipadoData<{ id_usuario : string, correo :string }>> => {

  // Verificar si el correo existe en la tabla alumnos (alumno real registrado)
  const sqlAlumnos : string = `SELECT dni_alumno, email FROM alumnos WHERE email = ?;`;
  const valoresAlumnos : unknown[] = [email];

  const resultadoAlumno = await buscarExistenteEntidad({
        slqEntidad : sqlAlumnos,
        valores : valoresAlumnos,
        entidad : "USUARIO_CORREO"
  });

  // Si ya existe un alumno con ese correo, devolver error
  if (resultadoAlumno.code === "USUARIO_CORREO_EXISTE") {
      return resultadoAlumno as any;
  }

  // Verificar si el correo existe en usuarios con rol alumno Y tiene registro en alumnos
  const sqlUsuarios : string = `
    SELECT u.id_usuario, u.correo FROM usuarios u
    INNER JOIN alumnos a ON u.correo = a.email
    WHERE u.correo = ? OR u.usuario = ?;
  `;
  const valoresUsuarios : unknown[] = [email, email];

  return await buscarExistenteEntidad({
        slqEntidad : sqlUsuarios,
        valores : valoresUsuarios,
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
            hashedPassword, // Contraseña ya hasheada
            data.nombre,
            data.apellido,
            data.celular,
            data.rol || 'alumno',
            data.email,
            data.estado || 'activos',
            data.id_escuela
        ]);

        const idUsuarioGenerado = resUsuario.insertId;

        // 4. Generar PIN de asistencia de 4 dígitos único para esta escuela
        let pinAsistencia: string;
        do {
            pinAsistencia = Math.floor(1000 + Math.random() * 9000).toString();
            // Verificar que el PIN no esté en uso en esta escuela
            const [pinRows]: any = await conn.execute(
                `SELECT a.pin_asistencia FROM alumnos a
                 INNER JOIN alumnos_en_escuela aee ON a.dni_alumno = aee.dni_alumno
                 WHERE a.pin_asistencia = ? AND aee.id_escuela = ?`,
                [pinAsistencia, data.id_escuela]
            );
            if (pinRows.length === 0) break;
        } while (true);

        // 5. Insertar en la tabla 'alumnos' (Entidad global) con PIN
        const sqlAlumno = `
            INSERT INTO alumnos (dni_alumno, nombre, apellido, email, numero_celular, pin_asistencia)
            VALUES (?, ?, ?, ?, ?, ?);
        `;

        await conn.execute(sqlAlumno, [
            data.dni,
            data.nombre,
            data.apellido,
            data.email,
            data.celular,
            pinAsistencia
        ]);

        // 5. Insertar en la tabla de relación 'alumnos_en_escuela'
        const sqlRelacionEscuela = `
            INSERT INTO alumnos_en_escuela (dni_alumno, id_escuela, fecha_alta_escuela) 
            VALUES (?, ?, ?);
        `;

        // Generamos la fecha actual para el alta en esta escuela específica
        const fechaActual = new Date();

        await conn.execute(sqlRelacionEscuela, [
            data.dni,
            data.id_escuela,
            fechaActual
        ]);

        // Retornamos los datos necesarios para el controlador (incluyendo la contraseña y PIN para el correo)
        return {
            id_usuario: idUsuarioGenerado,
            dni: data.dni,
            email: data.email,
            contrasenaTemporal: contrasenaPlano,
            pin_asistencia: pinAsistencia
        };
    });
};


export const modAlumnoTransaccion = async (data: AlumnosInputs) => {
    return await iudEntidadTransaction(async (conn) => {

        // 1. Buscamos el correo viejo que tiene actualmente en la BD usando el DNI
        const [alumnoRows]: any = await conn.execute(
            `SELECT email FROM alumnos WHERE dni_alumno = ?;`,
            [data.dni]
        );
        const correoViejo = alumnoRows[0]?.email;

        // 2. Con ese correo viejo, buscamos su id_usuario real en la tabla usuarios
        const [userRows]: any = await conn.execute(
            `SELECT id_usuario FROM usuarios WHERE correo = ? OR usuario = ?;`,
            [correoViejo, correoViejo]
        );
        const idUsuario = userRows[0]?.id_usuario;

        if (!idUsuario) {
            throw new Error(`No se encontró el id_usuario asociado para el alumno DNI ${data.dni}`);
        }

        // 3. Actualizar los datos personales en la tabla 'alumnos'
        const sqlAlumno = `
            UPDATE alumnos 
            SET nombre = ?, apellido = ?, email = ?, numero_celular = ?
            WHERE dni_alumno = ?;
        `;
        
        await conn.execute(sqlAlumno, [
            data.nombre,
            data.apellido,
            data.email,
            data.celular ?? null,
            data.dni
        ]);

        // 4. Actualizar la tabla 'usuarios' usando la clave primaria (id_usuario)
        const sqlUsuario = `
            UPDATE usuarios 
            SET nombre = ?, apellido = ?, celular = ?, correo = ?, usuario = ?
            WHERE id_usuario = ?;
        `;
        
        await conn.execute(sqlUsuario, [
            data.nombre,
            data.apellido,
            data.celular ?? null,
            data.email, // Nuevo correo
            data.email, // Nuevo usuario (para que coincida con el correo nuevo)
            idUsuario   // La clave primaria segura
        ]);

        return {
            code: "TRANSACCION_OK"
        };
    });
};

export const  method = {
    verAlumnoExistente : tryCatchDatos( verAlumnoExistente ),
    verAlumnoExistentePorEmail : tryCatchDatos( verAlumnoExistentePorEmail ),
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
    modAlumnoTransaccion : tryCatchDatos( modAlumnoTransaccion),
};