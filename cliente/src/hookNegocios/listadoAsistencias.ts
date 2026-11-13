import { useListadoAsistenciasLogica } from "../hooks/Asistencias/listadoAsistencias";

// Servicios ---------------------------------------------------
import { listadoAsistencias } from "../servicio/asistenciaListado.fetch";
import { listadoTipoSinPaginacion } from "../servicio/tipo.fetch";
import { listadoNivelSinPaginacion } from "../servicio/nivel.fetch";
import { listadoProfesoresSinPag } from "../servicio/profesor.usuarios";

// Catálogo de horas del proyecto (las clases se crean sólo en horas exactas)
import { HORARIOS } from "./horarios";

import type { OpcionListadoAsistencias } from "../tipadosTs/asistenciaListado.typado";

/**
 * Días de la semana para el `<select>` del filtro.
 *
 * El **valor** va sin tildes (`"miercoles"`), que es como lo guarda el `ENUM`
 * de `asistencias.dia_semana` y lo espera el backend; la **etiqueta** va con
 * tildes para leerla (CA-46).
 */
const DIAS_SEMANA: OpcionListadoAsistencias[] = [
    { valor : "lunes",     etiqueta : "Lunes" },
    { valor : "martes",    etiqueta : "Martes" },
    { valor : "miercoles", etiqueta : "Miércoles" },
    { valor : "jueves",    etiqueta : "Jueves" },
    { valor : "viernes",   etiqueta : "Viernes" },
    { valor : "sabado",    etiqueta : "Sábado" },
    { valor : "domingo",   etiqueta : "Domingo" }
];

/**
 * Horas para el `<select>` del filtro.
 *
 * Se arman con `HORARIOS` (`hookNegocios/horarios.ts`, `08:00` … `23:00`): el
 * proyecto sólo permite crear clases en horas exactas, así que ese es el
 * universo de horas posibles. No se inventa un catálogo nuevo ni se usa
 * `input[type="time"]`, que aceptaría horas que nunca existen en la escuela
 * (resolución del pendiente P6 del plan).
 */
const HORAS: OpcionListadoAsistencias[] = HORARIOS.map(( hora ) => ({
    valor    : hora,
    etiqueta : hora
}));

/**
 * Cableado de servicios de la página "Listado de Asistencias" (spec 048).
 *
 * Junta los cuatro servicios (`listado` + los tres catálogos), el estado
 * inicial (últimos 30 días, página 1, 15 filas) y las opciones de los
 * `<select>` que no salen del backend. La lógica vive en
 * `hooks/Asistencias/listadoAsistencias.ts`.
 *
 * @returns Estado y handlers que consume `ListadoAsistencias.tsx`.
 */
export const setListadoAsistencias = () => {

    const config = {
        servicios : {
            listado           : listadoAsistencias,
            listadoProfesores : listadoProfesoresSinPag,
            listadoNivel      : listadoNivelSinPaginacion,
            listadoTipo       : listadoTipoSinPaginacion
        },

        paginacion : {
            pagina         : 1,
            limite         : 15,
            contadorPagina : 0
        },

        opcionesDia  : DIAS_SEMANA,
        opcionesHora : HORAS
    };

    return useListadoAsistenciasLogica( config );
};
