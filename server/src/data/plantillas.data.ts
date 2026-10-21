import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { iudEntidadTransaction } from "../hooks/iudEntidadTRansaccion";
import pool from "../bd";
import { PlantillaAltaInputs, PlantillaBajaInputs, PlantillaListadoInputs, PlantillaAlumnosAgregarInputs, PlantillaAlumnoQuitarInputs } from "../squemas/plantillas";
import { TipadoData } from "../tipados/tipado.data";
import { PlantillaResumen } from "../tipados/plantillas.tipado";

const altaPlantilla = async ( data : PlantillaAltaInputs )
: Promise<TipadoData<{ id_plantilla : number }>> => {
    const { id_escuela, nombre, alumnos } = data;
    const sqlPlantilla = `INSERT INTO plantillas_asistencia (id_escuela, nombre, fecha_creacion) VALUES (?, ?, NOW());`;
    const sqlAlumno = `INSERT INTO plantilla_alumnos (id_plantilla, dni_alumno) VALUES (?, ?);`;
    const resultado = await iudEntidadTransaction(async (conn) => {
        const [res] = await conn.execute(sqlPlantilla, [id_escuela, nombre]);
        const idPlantilla = (res as any).insertId;
        for (const dni of alumnos) {
            await conn.execute(sqlAlumno, [idPlantilla, dni]);
        }
        return { id_plantilla: idPlantilla };
    });
    if (resultado.code === "TRANSACCION_OK") {
        return { error: false, message: "Plantilla creada", data: resultado.data, code: "TRANSACCION_OK" };
    }
    return { error: true, message: "Transaccion fallida", code: "TRANSACCION_FALLIDA" };
};

const bajaPlantilla = async ( data : PlantillaBajaInputs )
: Promise<TipadoData<{}>> => {
    const { id_escuela, id_plantilla } = data;
    await pool.execute(`DELETE FROM plantilla_alumnos WHERE id_plantilla = ?`, [id_plantilla]);
    const sql = `DELETE FROM plantillas_asistencia WHERE id_plantilla = ? AND id_escuela = ?;`;
    return await iudEntidad({ slqEntidad: sql, valores: [id_plantilla, id_escuela], metodo: "ELIMINAR", entidad: "plantilla", datosRetorno: {} });
};

const listarPlantillas = async ( data : PlantillaListadoInputs )
: Promise<TipadoData<PlantillaResumen[]>> => {
    const { id_escuela } = data;
    const [rows] : any = await pool.execute(
        `SELECT p.id_plantilla, p.nombre, DATE_FORMAT(p.fecha_creacion,'%Y-%m-%d') AS fecha_creacion
         FROM plantillas_asistencia p WHERE p.id_escuela = ? ORDER BY p.id_plantilla DESC`,
        [id_escuela]
    );
    const result: PlantillaResumen[] = [];
    for (const r of rows) {
        const [alRows] : any = await pool.execute(
            `SELECT dni_alumno FROM plantilla_alumnos WHERE id_plantilla = ?`,
            [r.id_plantilla]
        );
        result.push({
            id_plantilla: r.id_plantilla,
            nombre: r.nombre,
            fecha_creacion: r.fecha_creacion,
            alumnos: alRows.map((a: any) => Number(a.dni_alumno)),
        });
    }
    return { error: false, message: "Listado", data: result, code: "PLANTILLA_OK" };
};

/**
 * Agrega alumnos a una plantilla existente.
 *
 * - Si la plantilla no existe o no es de la escuela del usuario: `PLANTILLA_NO_EXISTE`.
 * - `INSERT IGNORE`: si el alumno ya estaba en la plantilla no falla (la PK
 *   compuesta `id_plantilla + dni_alumno` lo evita).
 */
const agregarAlumnosPlantilla = async ( data : PlantillaAlumnosAgregarInputs )
: Promise<TipadoData<{ agregados : number }>> => {
    const { id_escuela, id_plantilla, alumnos } = data;
    const [existe] : any = await pool.execute(
        `SELECT id_plantilla FROM plantillas_asistencia WHERE id_plantilla = ? AND id_escuela = ?`,
        [id_plantilla, id_escuela]
    );
    if (!existe || existe.length === 0) {
        return { error: true, message: "La plantilla no existe", code: "PLANTILLA_NO_EXISTE" };
    }
    const unicos = Array.from(new Set(alumnos));
    for (const dni of unicos) {
        await pool.execute(
            `INSERT IGNORE INTO plantilla_alumnos (id_plantilla, dni_alumno) VALUES (?, ?)`,
            [id_plantilla, dni]
        );
    }
    return { error: false, message: "Alumnos agregados", data: { agregados: unicos.length }, code: "PLANTILLA_ALUMNO_AGREGADO" };
};

/** Quita un alumno de una plantilla. */
const quitarAlumnoPlantilla = async ( data : PlantillaAlumnoQuitarInputs )
: Promise<TipadoData<{}>> => {
    const { id_escuela, id_plantilla, dni_alumno } = data;
    const [existe] : any = await pool.execute(
        `SELECT id_plantilla FROM plantillas_asistencia WHERE id_plantilla = ? AND id_escuela = ?`,
        [id_plantilla, id_escuela]
    );
    if (!existe || existe.length === 0) {
        return { error: true, message: "La plantilla no existe", code: "PLANTILLA_NO_EXISTE" };
    }
    await pool.execute(
        `DELETE FROM plantilla_alumnos WHERE id_plantilla = ? AND dni_alumno = ?`,
        [id_plantilla, dni_alumno]
    );
    return { error: false, message: "Alumno quitado", data: {}, code: "PLANTILLA_ALUMNO_QUITADO" };
};

export const method = {
    altaPlantilla : tryCatchDatos( altaPlantilla ),
    bajaPlantilla : tryCatchDatos( bajaPlantilla ),
    listarPlantillas : tryCatchDatos( listarPlantillas ),
    agregarAlumnosPlantilla : tryCatchDatos( agregarAlumnosPlantilla ),
    quitarAlumnoPlantilla : tryCatchDatos( quitarAlumnoPlantilla ),
};