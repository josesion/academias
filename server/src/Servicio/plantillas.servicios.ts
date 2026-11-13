import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as plantillasData } from "../data/plantillas.data";
import {
    PlantillaAltaSchema,
    PlantillaBajaSchema,
    PlantillaListadoSchema,
    PlantillaAlumnosAgregarSchema,
    PlantillaAlumnoQuitarSchema,
    PlantillaAltaInputs,
    PlantillaBajaInputs,
    PlantillaListadoInputs,
    PlantillaAlumnosAgregarInputs,
    PlantillaAlumnoQuitarInputs,
} from "../squemas/plantillas";
import { TipadoData } from "../tipados/tipado.data";
import { PlantillaResumen } from "../tipados/plantillas.tipado";

const altaPlantilla = async (data: PlantillaAltaInputs): Promise<TipadoData<{ id_plantilla: number }>> => {
    const parsed = PlantillaAltaSchema.parse(data);
    const resultado = await plantillasData.altaPlantilla(parsed);

    if (resultado.code === "TRANSACCION_OK") {
        return { error: false, message: "Plantilla creada", data: resultado.data, code: "PLANTILLA_OK" };
    }

    return { error: true, message: "Transaccion fallida", code: "TRANSACCION_FALLIDA" };
};

const bajaPlantilla = async (data: PlantillaBajaInputs): Promise<TipadoData<{}>> => {
    const parsed = PlantillaBajaSchema.parse(data);
    const resultado = await plantillasData.bajaPlantilla(parsed);

    if (resultado.code === "TRANSACCION_OK") {
        const affectedRows = resultado.data?.affectedRows ?? 0;

        if (affectedRows > 0) {
            return { error: false, message: "Plantilla eliminada", data: {}, code: "PLANTILLA_ELIMINAR" };
        }

        return { error: true, message: "La plantilla no existe", code: "PLANTILLA_NO_EXISTE" };
    }

    return { error: true, message: "Transaccion fallida", code: "TRANSACCION_FALLIDA" };
};

const listarPlantillas = async (data: PlantillaListadoInputs): Promise<TipadoData<PlantillaResumen[]>> => {
    const parsed = PlantillaListadoSchema.parse(data);
    const resultado = await plantillasData.listarPlantillas(parsed);

    if (resultado.code === "PLANTILLA_LISTED") {
        const filas = resultado.data ?? [];
        const plantillasMap = new Map<number, PlantillaResumen>();

        for (const fila of filas) {
            let plantilla = plantillasMap.get(fila.id_plantilla);

            if (!plantilla) {
                plantilla = {
                    id_plantilla: fila.id_plantilla,
                    nombre: fila.nombre,
                    fecha_creacion: fila.fecha_creacion,
                    alumnos: [],
                };
                plantillasMap.set(fila.id_plantilla, plantilla);
            }

            const dniAlumno = Number(fila.dni_alumno);
            if (!Number.isNaN(dniAlumno)) {
                plantilla.alumnos.push(dniAlumno);
            }
        }

        return { error: false, message: "Listado", data: Array.from(plantillasMap.values()), code: "PLANTILLA_OK" };
    }

    if (resultado.code === "NO_ACTIVE_PLANTILLAS") {
        return { error: false, message: "Listado", data: [], code: "PLANTILLA_OK" };
    }

    return { error: true, message: resultado.message, code: "ERROR_SERVIDOR" };
};

const agregarAlumnosPlantilla = async (data: PlantillaAlumnosAgregarInputs): Promise<TipadoData<{ agregados: number }>> => {
    const parsed = PlantillaAlumnosAgregarSchema.parse(data);
    const existe = await plantillasData.verificarPlantillaExistente(parsed);

    if (existe.code === "PLANTILLA_NO_EXISTE") {
        return { error: true, message: "La plantilla no existe", code: "PLANTILLA_NO_EXISTE" };
    }

    const unicos = Array.from(new Set(parsed.alumnos));
    const resultado = await plantillasData.agregarAlumnosPlantilla(parsed.id_plantilla, unicos);

    if (resultado.code === "TRANSACCION_OK") {
        return { error: false, message: "Alumnos agregados", data: { agregados: unicos.length }, code: "PLANTILLA_ALUMNO_AGREGADO" };
    }

    return { error: true, message: "Transaccion fallida", code: "TRANSACCION_FALLIDA" };
};

const quitarAlumnoPlantilla = async (data: PlantillaAlumnoQuitarInputs): Promise<TipadoData<{}>> => {
    const parsed = PlantillaAlumnoQuitarSchema.parse(data);
    const existe = await plantillasData.verificarPlantillaExistente(parsed);

    if (existe.code === "PLANTILLA_NO_EXISTE") {
        return { error: true, message: "La plantilla no existe", code: "PLANTILLA_NO_EXISTE" };
    }

    const resultado = await plantillasData.quitarAlumnoPlantilla(parsed.id_plantilla, parsed.dni_alumno);

    if (resultado.code === "TRANSACCION_OK") {
        return { error: false, message: "Alumno quitado", data: {}, code: "PLANTILLA_ALUMNO_QUITADO" };
    }

    return { error: true, message: "Transaccion fallida", code: "TRANSACCION_FALLIDA" };
};

export const method = {
    altaPlantilla: tryCatchDatos(altaPlantilla),
    bajaPlantilla: tryCatchDatos(bajaPlantilla),
    listarPlantillas: tryCatchDatos(listarPlantillas),
    agregarAlumnosPlantilla: tryCatchDatos(agregarAlumnosPlantilla),
    quitarAlumnoPlantilla: tryCatchDatos(quitarAlumnoPlantilla),
};
