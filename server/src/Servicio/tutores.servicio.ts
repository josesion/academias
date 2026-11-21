import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataTutor } from "../data/tutores.data";
import { registroHistorial } from "../utils/postHistorial";

import { CrearTutorSchema, TutorInputs,
        listaTutoresSchema, ListaTutorInputs,
        EliminarTutorSchema, EliminarTutorInputs,
        ListaTutorSinPaginacionInputs, listaTutoresSinPaginacionSchema,
} from "../squemas/tutores";

import type { RetornoRegistroTutor, RetornoModTutor, DataTutoresListado, DataTutoresListadoSinPag, DataTutoresPorAlumno }
         from "../tipados/tutores.data";
import { type HistorialInputs } from "../squemas/historial";
import { TipadoData } from "../tipados/tipado.data";

/**
 * Registra un nuevo tutor en el sistema.
 * Verifica que el DNI del tutor no exista ya y que el alumno al que representa sí exista.
 */
const altaTutor = async (data: TutorInputs)
: Promise<TipadoData<RetornoRegistroTutor>> => {

    const tutorData: TutorInputs = CrearTutorSchema.parse(data);

    // Verificar que el tutor no exista ya
    const existeTutor = await dataTutor.verTutorExistente(tutorData.dni_tutor);

    if (existeTutor.code === 'TUTOR_EXISTE') {
        return {
            error: true,
            message: "El tutor ya se encuentra registrado con ese DNI",
            code: "TUTOR_YA_REGISTRADO"
        };
    }

    // Registrar el tutor
    const registrarTutor = await dataTutor.registrarTutor(tutorData);

    if (registrarTutor.code === "TUTOR_CREAR") {
        const dataHistorial: HistorialInputs = {
            id_escuela: tutorData.id_escuela,
            id_usuario: tutorData.id_usuario,
            modulo: "TUTORES",
            accion: "CREAR",
            id_registro: 0,
            descripcion: `Registro Tutor ${tutorData.apellido} ${tutorData.nombre} para alumno ${tutorData.dni_alumno}`,
            datos: tutorData
        };

        await registroHistorial(dataHistorial);

        return {
            error: false,
            message: "Se registró correctamente el tutor",
            code: "REGISTRO_TUTOR_OK",
            data: registrarTutor.data
        };
    }

    return {
        error: true,
        message: "Error al registrar el tutor, intente nuevamente.",
        code: "ERROR_SERVIDOR"
    };
};

/**
 * Modifica los datos de un tutor existente.
 */
const modTutor = async (data: TutorInputs)
: Promise<TipadoData<RetornoModTutor>> => {

    const tutorData: TutorInputs = CrearTutorSchema.parse(data);

    const resultadoModificacion = await dataTutor.modTutor(tutorData);

    if (resultadoModificacion.code === "TUTOR_MODIFICAR") {
        const dataHistorial: HistorialInputs = {
            id_escuela: tutorData.id_escuela,
            id_usuario: tutorData.id_usuario,
            modulo: "TUTORES",
            accion: "MODIFICAR",
            id_registro: 0,
            descripcion: `Modificación de tutor ${tutorData.apellido} ${tutorData.nombre}`,
            datos: tutorData
        };

        await registroHistorial(dataHistorial);

        return {
            error: false,
            message: "Se modificó correctamente el tutor",
            code: "TUTOR_MODIFICAR_OK",
            data: resultadoModificacion.data
        };
    }

    return {
        error: true,
        message: "Error al modificar el tutor, intente nuevamente.",
        code: "ERROR_SERVIDOR"
    };
};

/**
 * Cambia el estado de un tutor (activar/inactivar).
 */
const estadoTutor = async (data: EliminarTutorInputs)
: Promise<TipadoData<{ id_tutor: number }>> => {

    const tutorData: EliminarTutorInputs = EliminarTutorSchema.parse(data);
    const respuesta = await dataTutor.eliminarTutor(tutorData);
    const estadoFinal = tutorData.estado === "activos" ? "activo" : "inactivo";
    const accionFinal = tutorData.estado === "activos" ? "RESTAURAR" : "ELIMINAR";

    if (respuesta.code === 'TUTOR_ELIMINAR') {
        const dataHistorial: HistorialInputs = {
            id_escuela: tutorData.id_escuela,
            id_usuario: tutorData.id_usuario,
            modulo: "TUTORES",
            accion: accionFinal,
            id_registro: tutorData.id_tutor,
            descripcion: `Estado de tutor (id: ${tutorData.id_tutor}) cambió a ${estadoFinal}`,
            datos: tutorData
        };

        await registroHistorial(dataHistorial);

        return {
            error: false,
            message: "Se modificó el estado del tutor correctamente",
            code: "CAMBIO_ESTADO_TUTOR_OK",
            data: { id_tutor: tutorData.id_tutor }
        };
    }

    return {
        error: true,
        message: "Error en el servidor, intentar nuevamente.",
        code: "ERROR_SERVIDOR"
    };
};

/**
 * Obtiene el listado paginado de tutores de una escuela.
 */
const listaTutores = async (data: ListaTutorInputs)
: Promise<TipadoData<DataTutoresListado[]>> => {

    const listadoData: ListaTutorInputs = listaTutoresSchema.parse(data);
    const respuesta = await dataTutor.listaTutores(listadoData, data.pagina);

    if (respuesta.code === 'TUTOR_LISTED') {
        return {
            error: false,
            message: "Listado de tutores",
            code: "TUTOR_LISTED_OK",
            data: respuesta.data,
            paginacion: respuesta.paginacion
        };
    }

    return {
        error: true,
        message: "Error en el servidor, intentar nuevamente.",
        code: "ERROR_SERVIDOR"
    };
};

/**
 * Obtiene el listado sin paginación de tutores.
 */
const listadoSinPaginacion = async (data: ListaTutorSinPaginacionInputs)
: Promise<TipadoData<DataTutoresListadoSinPag[]>> => {

    const dataListado: ListaTutorSinPaginacionInputs = listaTutoresSinPaginacionSchema.parse(data);
    const respuesta = await dataTutor.listadoSinPaginacion(dataListado);

    if (respuesta.code === 'TUTOR_LISTED') {
        return {
            error: false,
            message: "Listado de tutores",
            code: "TUTOR_LISTED_OK",
            data: respuesta.data
        };
    }

    return {
        error: true,
        message: "Error en el servidor, intentar nuevamente.",
        code: "ERROR_SERVIDOR"
    };
};

/**
 * Obtiene los tutores asociados a un alumno por su DNI.
 */
const tutoresPorAlumno = async (dni_alumno: string, id_escuela: number)
: Promise<TipadoData<DataTutoresPorAlumno[]>> => {

    const respuesta = await dataTutor.tutoresPorAlumno(dni_alumno, id_escuela);

    if (respuesta.code === 'TUTOR_LISTED') {
        return {
            error: false,
            message: "Tutores del alumno",
            code: "TUTOR_POR_ALUMNO_OK",
            data: respuesta.data || []
        };
    }

    return {
        error: true,
        message: "Error en el servidor, intentar nuevamente.",
        code: "ERROR_SERVIDOR"
    };
};

export const method = {
    altaTutor: tryCatchDatos(altaTutor),
    modTutor: tryCatchDatos(modTutor),
    estadoTutor: tryCatchDatos(estadoTutor),
    listaTutores: tryCatchDatos(listaTutores),
    listadoSinPaginacion: tryCatchDatos(listadoSinPaginacion),
    tutoresPorAlumno: tryCatchDatos(tutoresPorAlumno),
};
