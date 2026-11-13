import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidadTransaction } from "../hooks/iudEntidadTRansaccion";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";
import { PlantillaAltaInputs, PlantillaBajaInputs, PlantillaListadoInputs } from "../squemas/plantillas";
import { TipadoData } from "../tipados/tipado.data";

interface FilaPlantillaListado {
    id_plantilla: number;
    nombre: string;
    fecha_creacion: string;
    dni_alumno?: number;
}

const altaPlantilla = async (data: PlantillaAltaInputs): Promise<TipadoData<{ id_plantilla: number }>> => {
    const { id_escuela, nombre, alumnos } = data;

    return await iudEntidadTransaction(async (conn) => {
        const [resPlantilla] = await conn.execute(
            `INSERT INTO plantillas_asistencia (id_escuela, nombre, fecha_creacion) VALUES (?, ?, NOW());`,
            [id_escuela, nombre]
        );
        const idPlantilla = (resPlantilla as { insertId: number }).insertId;

        for (const dni of alumnos) {
            await conn.execute(
                `INSERT INTO plantilla_alumnos (id_plantilla, dni_alumno) VALUES (?, ?);`,
                [idPlantilla, dni]
            );
        }

        return { id_plantilla: idPlantilla };
    });
};

const bajaPlantilla = async (data: PlantillaBajaInputs): Promise<TipadoData<{ affectedRows: number }>> => {
    const { id_escuela, id_plantilla } = data;

    return await iudEntidadTransaction(async (conn) => {
        await conn.execute(`DELETE FROM plantilla_alumnos WHERE id_plantilla = ?`, [id_plantilla]);
        const [res] = await conn.execute(
            `DELETE FROM plantillas_asistencia WHERE id_plantilla = ? AND id_escuela = ?`,
            [id_plantilla, id_escuela]
        );
        const affectedRows = (res as { affectedRows?: number }).affectedRows ?? 0;
        return { affectedRows };
    });
};

const listarPlantillas = async (data: PlantillaListadoInputs): Promise<TipadoData<FilaPlantillaListado[]>> => {
    const { id_escuela } = data;

    return await listarEntidadSinPaginacion<FilaPlantillaListado>({
        slqListado: `SELECT p.id_plantilla, p.nombre, DATE_FORMAT(p.fecha_creacion, '%Y-%m-%d') AS fecha_creacion, pa.dni_alumno
                 FROM plantillas_asistencia p
                 LEFT JOIN plantilla_alumnos pa ON pa.id_plantilla = p.id_plantilla
                 WHERE p.id_escuela = ?
                 ORDER BY p.id_plantilla DESC, pa.dni_alumno ASC`,
        valores: [id_escuela],
        entidad: "Plantilla",
        estado: "asistencias",
    });
};

const verificarPlantillaExistente = async (data: PlantillaBajaInputs): Promise<TipadoData<{ id_plantilla: number }>> => {
    return await buscarExistenteEntidad<{ id_plantilla: number }>({
        slqEntidad: `SELECT id_plantilla FROM plantillas_asistencia WHERE id_plantilla = ? AND id_escuela = ?`,
        valores: [data.id_plantilla, data.id_escuela],
        entidad: "Plantilla",
    });
};

const agregarAlumnosPlantilla = async (id_plantilla: number, alumnos: number[]): Promise<TipadoData<{ agregados: number }>> => {
    const resultado = await iudEntidadTransaction(async (conn) => {
        for (const dni of alumnos) {
            await conn.execute(
                `INSERT IGNORE INTO plantilla_alumnos (id_plantilla, dni_alumno) VALUES (?, ?)`,
                [id_plantilla, dni]
            );
        }

        return { agregados: alumnos.length };
    });

    return resultado;
};

const quitarAlumnoPlantilla = async (id_plantilla: number, dni_alumno: number): Promise<TipadoData<{}>> => {
    return await iudEntidadTransaction(async (conn) => {
        await conn.execute(
            `DELETE FROM plantilla_alumnos WHERE id_plantilla = ? AND dni_alumno = ?`,
            [id_plantilla, dni_alumno]
        );

        return {};
    });
};

export const method = {
    altaPlantilla: tryCatchDatos(altaPlantilla),
    bajaPlantilla: tryCatchDatos(bajaPlantilla),
    listarPlantillas: tryCatchDatos(listarPlantillas),
    verificarPlantillaExistente: tryCatchDatos(verificarPlantillaExistente),
    agregarAlumnosPlantilla: tryCatchDatos(agregarAlumnosPlantilla),
    quitarAlumnoPlantilla: tryCatchDatos(quitarAlumnoPlantilla),
};
