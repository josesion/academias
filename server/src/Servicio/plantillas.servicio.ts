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

/** Crea una plantilla con su lista de alumnos. */
const altaPlantillaServicio = async ( data : PlantillaAltaInputs ) : Promise<TipadoData<{ id_plantilla : number }>> => {
    const parsed = PlantillaAltaSchema.parse(data);
    return await plantillasData.altaPlantilla(parsed);
};

/** Elimina una plantilla y sus alumnos. */
const bajaPlantillaServicio = async ( data : PlantillaBajaInputs ) : Promise<TipadoData<{}>> => {
    const parsed = PlantillaBajaSchema.parse(data);
    return await plantillasData.bajaPlantilla(parsed);
};

/** Lista las plantillas de la escuela con sus alumnos. */
const listarPlantillasServicio = async ( data : PlantillaListadoInputs ) : Promise<TipadoData<PlantillaResumen[]>> => {
    const parsed = PlantillaListadoSchema.parse(data);
    return await plantillasData.listarPlantillas(parsed);
};

/** Agrega alumnos a una plantilla existente. */
const agregarAlumnosPlantillaServicio = async ( data : PlantillaAlumnosAgregarInputs )
: Promise<TipadoData<{ agregados : number }>> => {
    const parsed = PlantillaAlumnosAgregarSchema.parse(data);
    return await plantillasData.agregarAlumnosPlantilla(parsed);
};

/** Quita un alumno de una plantilla. */
const quitarAlumnoPlantillaServicio = async ( data : PlantillaAlumnoQuitarInputs )
: Promise<TipadoData<{}>> => {
    const parsed = PlantillaAlumnoQuitarSchema.parse(data);
    return await plantillasData.quitarAlumnoPlantilla(parsed);
};

export const method = {
    altaPlantilla : tryCatchDatos( altaPlantillaServicio ),
    bajaPlantilla : tryCatchDatos( bajaPlantillaServicio ),
    listarPlantillas : tryCatchDatos( listarPlantillasServicio ),
    agregarAlumnosPlantilla : tryCatchDatos( agregarAlumnosPlantillaServicio ),
    quitarAlumnoPlantilla : tryCatchDatos( quitarAlumnoPlantillaServicio ),
};
