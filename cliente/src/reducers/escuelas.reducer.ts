import type { EscuelaListadoRow } from "../servicio/escuelas.fetch";

/* ==========================================================================
   ESTRUCTURA DEL ARCHIVO
   Todo está agrupado por especificidad, con el mismo orden en el tipado,
   el estado inicial, las acciones y el reducer:

   1. FORMULARIO (POST / PUT)  -> alta y edición de una escuela
   2. CAMBIO DE ESTADO         -> modal de dar de alta / baja
   3. LISTADO                  -> datos de la tabla, carga, errores, paginación
   4. FILTROS                  -> buscador del listado
   ========================================================================== */

/* ==========================================================================
   TIPOS AUXILIARES
   ========================================================================== */

export interface CeldasInput {
    name: string;
    value: string;
}

export interface Paginacion {
    pagina: number;
    limite: number;
    contadorPagina: number;
}

/* ==========================================================================
   ESTADO
   ========================================================================== */

export interface EscuelasTipado {

    /* ---------- 1. FORMULARIO (POST / PUT) ---------- */
    metodo: "POST" | "PUT" | null;
    modalAbierto: boolean;
    id_escuela: number | null;
    error: string | null;
    carga: boolean; // lo comparten el formulario y el modal de estado

    formulario: {
        dni_propietario: CeldasInput;
        nombre_propietario: CeldasInput;
        apellido_propietario: CeldasInput;
        razon_social: CeldasInput;
        direccion: CeldasInput;
        celular: CeldasInput;
    };

    imagen: {
        imagen: File | null;
        urlVistaPrevia: string | null;
        modificado?: boolean | null;
    };

    /* ---------- 2. CAMBIO DE ESTADO (alta / baja) ---------- */
    modalEstado: boolean;
    errorEstado: string | null;
    estadoListado: "activos" | "inactivos" | null; // define si la acción es dar de alta o de baja

    /* ---------- 3. LISTADO ---------- */
    listadoEscuelas: EscuelaListadoRow[] | null;
    cargaListado: boolean;
    errorListado: string | null;
    actualizar: number; // contador que fuerza a volver a pedir el listado
    paginacion: Paginacion;

    /* ---------- 4. FILTROS ---------- */
    filtros: {
        apellido: CeldasInput;
        razon_social: CeldasInput;
        estado: "activos" | "inactivos" | null;
    };
}

/* ==========================================================================
   ESTADO INICIAL
   ========================================================================== */

export const initialEscuelas = (): EscuelasTipado => ({

    /* ---------- 1. FORMULARIO (POST / PUT) ---------- */
    metodo: "POST",
    modalAbierto: false,
    id_escuela: null,
    error: null,
    carga: false,

    formulario: {
        dni_propietario: { name: "dni_propietario", value: "" },
        nombre_propietario: { name: "nombre_propietario", value: "" },
        apellido_propietario: { name: "apellido_propietario", value: "" },
        razon_social: { name: "razon_social", value: "" },
        direccion: { name: "direccion", value: "" },
        celular: { name: "celular", value: "" },
    },

    imagen: {
        imagen: null,
        urlVistaPrevia: null,
        modificado: null,
    },

    /* ---------- 2. CAMBIO DE ESTADO (alta / baja) ---------- */
    modalEstado: false,
    errorEstado: null,
    estadoListado: "activos",

    /* ---------- 3. LISTADO ---------- */
    listadoEscuelas: null,
    cargaListado: false,
    errorListado: null,
    actualizar: 0,

    paginacion: {
        pagina: 1,
        limite: 30,
        contadorPagina: 1,
    },

    /* ---------- 4. FILTROS ---------- */
    filtros: {
        apellido: { name: "apellido", value: "" },
        razon_social: { name: "razon_social", value: "" },
        estado: null,
    },
});

/* ==========================================================================
   ACCIONES
   ========================================================================== */

export type EscuelasAction =

    /* ---------- 1. FORMULARIO (POST / PUT) ---------- */
    | { type: "SET_METODO"; payload: "POST" | "PUT" | null }
    | { type: "ABRIR_MODAL"; payload: "POST" | "PUT" }
    | { type: "CERRAR_MODAL" }
    | { type: "ID_ESCUELA"; payload: number | null }
    | { type: "SET_CAMPO_FORM"; payload: { field: keyof EscuelasTipado["formulario"]; value: string } }
    | { type: "CARGAR_ESCUELA_EDICION"; payload: any } // recibe los datos de la escuela a editar
    | { type: "ERROR_GENERICO"; payload: string | null }
    | { type: "SET_CARGA"; payload: boolean }
    | { type: "RESET_FORM" }
    // Imagen del formulario
    | { type: "SET_IMAGEN"; payload: File | null }
    | { type: "SET_IMAGEN_MOD"; payload: boolean }

    /* ---------- 2. CAMBIO DE ESTADO (alta / baja) ---------- */
    | { type: "SET_MODAL_ESTADO"; payload: boolean }
    | { type: "SET_ESTADO_LISTADO"; payload: "activos" | "inactivos" | null }
    | { type: "ERROR_ESTADO"; payload: string | null }
    | { type: "CERRAR_MODAL_ESTADO" }

    /* ---------- 3. LISTADO ---------- */
    | { type: "SET_LISTADO_ESCUELA"; payload: EscuelaListadoRow[] | null }
    | { type: "SET_CARGA_LISTADO"; payload: boolean }
    | { type: "ERROR_GENERICO_LISTADO"; payload: string | null }
    | { type: "ACTUALIZAR" }
    | { type: "SET_PAGINACION"; payload: Partial<Paginacion> }

    /* ---------- 4. FILTROS ---------- */
    | { type: "SET_CAMPO_FILTRO"; payload: { field: keyof EscuelasTipado["filtros"]; value: string | null } }
    | { type: "RESET_FILTROS" };

/* ==========================================================================
   REDUCER
   ========================================================================== */

export const EscuelasReducer = (
    state: EscuelasTipado,
    action: EscuelasAction
): EscuelasTipado => {

    switch (action.type) {

        /* ==================================================================
           1. FORMULARIO (POST / PUT)
           ================================================================== */

        case "SET_METODO":
            return {
                ...state,
                metodo: action.payload,
            };

        case "ABRIR_MODAL":
            return {
                ...state,
                modalAbierto: true,
                metodo: action.payload, // setea automáticamente si es POST o PUT al abrir
            };

        case "CERRAR_MODAL":
            return {
                ...state,
                modalAbierto: false,
                // Reseteamos los campos del formulario y errores del form, PERO PRESERVAMOS EL LISTADO
                metodo: "POST",
                error: null,
                carga: false,
                formulario: {
                    dni_propietario: { name: "dni_propietario", value: "" },
                    nombre_propietario: { name: "nombre_propietario", value: "" },
                    apellido_propietario: { name: "apellido_propietario", value: "" },
                    razon_social: { name: "razon_social", value: "" },
                    direccion: { name: "direccion", value: "" },
                    celular: { name: "celular", value: "" },
                },
                imagen: {
                    imagen: null,
                    urlVistaPrevia: null,
                    modificado: null,
                },
                // listadoEscuelas, cargaListado y errorListado se quedan intactos gracias al ...state
            };

        case "ID_ESCUELA":
            return {
                ...state,
                id_escuela: action.payload,
            };

        case "SET_CAMPO_FORM":
            return {
                ...state,
                formulario: {
                    ...state.formulario,
                    [action.payload.field]: {
                        ...state.formulario[action.payload.field],
                        value: action.payload.value,
                    },
                },
            };

        case "CARGAR_ESCUELA_EDICION":
            // Útil cuando abrís el modal para editar y cargás los datos existentes
            return {
                ...state,
                metodo: "PUT",
                formulario: {
                    dni_propietario: { name: "dni_propietario", value: String(action.payload.dni_propietario || "") },
                    nombre_propietario: { name: "nombre_propietario", value: action.payload.nombre_propietario || "" },
                    apellido_propietario: { name: "apellido_propietario", value: action.payload.apellido_propietario || "" },
                    razon_social: { name: "razon_social", value: action.payload.razon_social || "" },
                    direccion: { name: "direccion", value: action.payload.direccion || "" },
                    celular: { name: "celular", value: action.payload.celular || "" },
                },
                imagen: {
                    imagen: null, // de entrada no hay un File nuevo cargado
                    urlVistaPrevia: action.payload.urlImagen || "",
                    modificado: false, // arranca en false porque todavía no tocó la imagen en el PUT
                },
            };

        case "ERROR_GENERICO":
            return {
                ...state,
                error: action.payload,
            };

        case "SET_CARGA":
            return {
                ...state,
                carga: action.payload,
            };

        case "RESET_FORM":
            return {
                ...state,
                metodo: null,
                error: null,
                carga: false,
                id_escuela: null,
                formulario: {
                    dni_propietario: { name: "dni_propietario", value: "" },
                    nombre_propietario: { name: "nombre_propietario", value: "" },
                    apellido_propietario: { name: "apellido_propietario", value: "" },
                    razon_social: { name: "razon_social", value: "" },
                    direccion: { name: "direccion", value: "" },
                    celular: { name: "celular", value: "" },
                },
                imagen: {
                    imagen: null,
                    urlVistaPrevia: null,
                    modificado: null,
                },
                // Forzamos explícitamente a mantener lo que ya tenía el listado y el modal
                listadoEscuelas: state.listadoEscuelas,
                cargaListado: state.cargaListado,
                errorListado: state.errorListado,
                modalAbierto: false,
            };

        // ---------- Imagen del formulario ----------

        case "SET_IMAGEN":
            return {
                ...state,
                imagen: {
                    ...state.imagen,
                    imagen: action.payload,
                    // Si hay archivo nuevo, creamos una URL local temporal para mostrarla en pantalla
                    urlVistaPrevia: action.payload ? URL.createObjectURL(action.payload) : null,
                    modificado: state.metodo === "PUT" ? true : null,
                },
            };

        case "SET_IMAGEN_MOD":
            return {
                ...state,
                imagen: {
                    ...state.imagen,
                    modificado: action.payload,
                },
            };

        /* ==================================================================
           2. CAMBIO DE ESTADO (alta / baja)
           ================================================================== */

        case "SET_MODAL_ESTADO":
            return {
                ...state,
                modalEstado: action.payload,
            };

        case "SET_ESTADO_LISTADO":
            return {
                ...state,
                estadoListado: action.payload,
            };

        case "ERROR_ESTADO":
            return {
                ...state,
                errorEstado: action.payload,
            };

        case "CERRAR_MODAL_ESTADO":
            return {
                ...state,
                modalEstado: false,
                estadoListado: "activos", // mismo valor que initialEscuelas
                errorEstado: null,
            };            

        /* ==================================================================
           3. LISTADO
           ================================================================== */

        case "SET_LISTADO_ESCUELA":
            return {
                ...state,
                listadoEscuelas: action.payload,
            };

        case "SET_CARGA_LISTADO":
            return {
                ...state,
                cargaListado: action.payload,
            };

        case "ERROR_GENERICO_LISTADO":
            return {
                ...state,
                errorListado: action.payload,
            };

        case "ACTUALIZAR":
            return {
                ...state,
                actualizar: state.actualizar + 1,
            };

        case "SET_PAGINACION":
            return {
                ...state,
                paginacion: {
                    ...state.paginacion,
                    ...action.payload,
                },
            };

        /* ==================================================================
           4. FILTROS
           ================================================================== */

        case "SET_CAMPO_FILTRO":
            return {
                ...state,
                filtros: {
                    ...state.filtros,
                    [action.payload.field]: action.payload.field === "estado"
                        ? action.payload.value
                        : {
                            ...state.filtros[action.payload.field],
                            value: action.payload.value,
                        },
                },
            };

        case "RESET_FILTROS":
            return {
                ...state,
                filtros: {
                    apellido: { name: "apellido", value: "" },
                    razon_social: { name: "razon_social", value: "" },
                    estado: null,
                },
            };

        default:
            return state;
    }
};