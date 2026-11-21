import { tryCatchDatos } from "../utils/tryCatchBD";
import { listarEntidad } from "../hooks/funcionListar";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

import { TipadoData } from "../tipados/tipado.data";
import { TutorInputs, ListaTutorInputs, EliminarTutorInputs, ListaTutorSinPaginacionInputs } from "../squemas/tutores";
import { RetornoRegistroTutor, DataTutoresListado, RetornoModTutor, RetornoEliminacionTutor,
         RetornoVerTutorExistente, DataTutoresListadoSinPag, DataTutoresPorAlumno } from "../tipados/tutores.data";

/** Verifica si el tutor ya existe en la BD por DNI */
const verTutorExistente = async (dni: string)
: Promise<TipadoData<RetornoVerTutorExistente | undefined>> => {

    const dniNumber = Number(dni);
    const slq: string = `SELECT dni_tutor FROM tutores WHERE dni_tutor = ?;`;
    const valor: unknown[] = [dniNumber];

    return await buscarExistenteEntidad<RetornoVerTutorExistente>({
        slqEntidad: slq,
        valores: valor,
        entidad: "Tutor",
    });
};

/** Registra un nuevo tutor */
const registrarTutor = async (parametros: TutorInputs)
: Promise<TipadoData<RetornoRegistroTutor>> => {

    const { dni_tutor, nombre, apellido, email, celular, relacion_con_alumno, dni_alumno } = parametros;

    const sql: string = `INSERT INTO tutores 
                        (dni_tutor, nombre, apellido, email, numero_celular, relacion_con_alumno, dni_alumno)
                        VALUES (?, ?, ?, ?, ?, ?, ?);`;

    const valores: unknown[] = [dni_tutor, nombre, apellido, email || null, celular, relacion_con_alumno, dni_alumno];

    return await iudEntidad({
        slqEntidad: sql,
        valores,
        entidad: "Tutor",
        metodo: "CREAR",
        datosRetorno: { dni_tutor, nombre, apellido, celular, email, relacion_con_alumno, dni_alumno }
    });
};

/** Modifica los datos de un tutor existente */
const modTutor = async (parametros: TutorInputs)
: Promise<TipadoData<RetornoModTutor>> => {

    const { dni_tutor, nombre, apellido, email, celular, relacion_con_alumno } = parametros;
    const sql: string = `UPDATE tutores
                        SET nombre = ?, apellido = ?, email = ?, numero_celular = ?, relacion_con_alumno = ?
                        WHERE dni_tutor = ?;`;

    const valores: unknown[] = [nombre, apellido, email || null, celular, relacion_con_alumno, dni_tutor];
    const datosADevolver: RetornoRegistroTutor = { dni_tutor, nombre, apellido, celular, email, relacion_con_alumno, dni_alumno: '' };

    return await iudEntidad({
        slqEntidad: sql,
        valores,
        entidad: "Tutor",
        metodo: "MODIFICAR",
        datosRetorno: datosADevolver
    });
};

/** Cambia el estado de un tutor (activar/inactivar) */
const eliminarTutor = async (parametros: EliminarTutorInputs)
: Promise<TipadoData<RetornoEliminacionTutor>> => {
    const { id_tutor, estado } = parametros;
    const sql = `UPDATE tutores SET estado = ? WHERE id_tutor = ?;`;
    const valores = [estado, id_tutor];

    return await iudEntidad({
        slqEntidad: sql,
        valores,
        entidad: "Tutor",
        metodo: "ELIMINAR",
        datosRetorno: { id_tutor }
    });
};

/** Lista tutores con paginación, filtrando por escuela a través de alumnos_en_escuela */
const listaTutores = async (
    params: ListaTutorInputs,
    pagina: string
): Promise<TipadoData<DataTutoresListado[]>> => {
    const { estado, dni, email, apellido, limit, offset, escuela } = params;

    const condiciones: string[] = [
        "tutores.estado = ?",
        "aee.id_escuela = ?"
    ];
    const valoresBase: unknown[] = [estado, escuela];

    if (dni && dni.trim() !== "") {
        condiciones.push("CAST(tutores.dni_tutor AS CHAR) LIKE ?");
        valoresBase.push((dni || "") + "%");
    }

    if (email && email.trim() !== "") {
        condiciones.push("tutores.email LIKE ?");
        valoresBase.push((email || "") + "%");
    }

    if (apellido && apellido.trim() !== "") {
        condiciones.push("tutores.apellido LIKE ?");
        valoresBase.push(apellido + "%");
    }

    const sqlLista = `SELECT
                            tutores.id_tutor,
                            tutores.dni_tutor,
                            tutores.nombre,
                            tutores.apellido,
                            tutores.email,
                            tutores.numero_celular,
                            tutores.relacion_con_alumno,
                            tutores.dni_alumno,
                            tutores.estado,
                            COUNT(*) OVER() as total_registros
                        FROM tutores
                        JOIN alumnos_en_escuela aee ON tutores.dni_alumno = aee.dni_alumno
                        WHERE
                            ${condiciones.join("\n                            AND ")}
                        ORDER BY tutores.apellido
                        LIMIT ${limit}
                        OFFSET ${offset};`;

    const valores: unknown[] = valoresBase;

    return await listarEntidad<DataTutoresListado>({
        slqListado: sqlLista,
        valores,
        limit,
        pagina,
        entidad: "Tutor",
        estado
    });
};

/** Lista tutores sin paginación */
const listadoSinPaginacion = async (parametros: ListaTutorSinPaginacionInputs)
: Promise<TipadoData<DataTutoresListadoSinPag[]>> => {
    const { dni, email, escuela, estado } = parametros;

    const condiciones: string[] = [
        "tutores.estado = ?",
        "aee.id_escuela = ?"
    ];
    const valoresBase: unknown[] = [estado, escuela];

    if (dni && dni.trim() !== "") {
        condiciones.push("CAST(tutores.dni_tutor AS CHAR) LIKE ?");
        valoresBase.push((dni || "") + "%");
    }

    if (email && email.trim() !== "") {
        condiciones.push("tutores.email LIKE ?");
        valoresBase.push((email || "") + "%");
    }

    const sql: string = `SELECT
                                tutores.id_tutor,
                                tutores.dni_tutor,
                                tutores.nombre,
                                tutores.apellido,
                                tutores.email,
                                tutores.numero_celular,
                                tutores.relacion_con_alumno,
                                tutores.dni_alumno,
                                tutores.estado
                            FROM tutores
                            JOIN alumnos_en_escuela aee ON tutores.dni_alumno = aee.dni_alumno
                            WHERE
                                ${condiciones.join("\n                                AND ")}
                            ORDER BY tutores.apellido
                            LIMIT 15`;

    const valores: unknown[] = valoresBase;

    return await listarEntidadSinPaginacion<DataTutoresListadoSinPag>({
        slqListado: sql,
        valores,
        entidad: "Tutor",
        estado
    });
};

/** Obtiene los tutores asociados a un alumno por DNI */
const tutoresPorAlumno = async (dni_alumno: string, id_escuela: number)
: Promise<TipadoData<DataTutoresPorAlumno[]>> => {

    const sql: string = `SELECT
                            tutores.id_tutor,
                            tutores.dni_tutor,
                            tutores.nombre,
                            tutores.apellido,
                            tutores.email,
                            tutores.numero_celular,
                            tutores.relacion_con_alumno,
                            tutores.estado
                        FROM tutores
                        WHERE tutores.dni_alumno = ?
                        AND tutores.estado = 'activos'
                        ORDER BY tutores.apellido;`;

    const valores: unknown[] = [Number(dni_alumno)];

    return await listarEntidadSinPaginacion<DataTutoresPorAlumno>({
        slqListado: sql,
        valores,
        entidad: "Tutor",
        estado: "activos"
    });
};

export const method = {
    verTutorExistente: tryCatchDatos(verTutorExistente),
    registrarTutor: tryCatchDatos(registrarTutor, "Tutor"),
    modTutor: tryCatchDatos(modTutor),
    eliminarTutor: tryCatchDatos(eliminarTutor),
    listaTutores: tryCatchDatos(listaTutores),
    listadoSinPaginacion: tryCatchDatos(listadoSinPaginacion),
    tutoresPorAlumno: tryCatchDatos(tutoresPorAlumno),
};
