import { useReducer, useEffect } from "react";

import { initialEscuelas, EscuelasReducer, type EscuelasAction } from "../../reducers/escuelas.reducer";
import { useEffectServicio } from "../../utils/useEfectServicio";

import { type EscuelasTipado } from "../../reducers/escuelas.reducer";
import type { EscuelaListadoRow, PutEscuelasInputs } from "../../servicio/escuelas.fetch";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

export interface EscuelasProps {
    servicios: {
        postEscuelas: ServicioCrud,
        getEscuelas: ServicioCrud,
        putEscuelas: ServicioCrud,
        estadoEscuelas: ServicioCrud
    }
};

/* ==========================================================================
   ESTRUCTURA DEL HOOK

   primero lo que CACHEA datos en el estado, después lo que llama a SERVICIOS.

   1. FORMULARIO (POST / PUT)  -> alta y edición de una escuela
   2. CAMBIO DE ESTADO         -> modal de dar de alta / baja
   3. LISTADO                  -> pedido de datos y paginación
   4. FILTROS                  -> buscador del listado
   ========================================================================== */

export const EscuelasLogica = (config: EscuelasProps) => {

    const [state, dispatch] = useReducer(EscuelasReducer, initialEscuelas());
    const { imagen } = state;
    const { urlVistaPrevia } = imagen;

    /* ======================================================================
       1. FORMULARIO (POST / PUT)
       ====================================================================== */

    // ---------- Cachear información del formulario ----------

    // Abre el modal en modo alta
    const hanldeAbrirPostFormulario = () => {
        dispatch({ type: "ABRIR_MODAL", payload: "POST" });
    };

    // Cierra el modal y limpia el formulario (el listado no se toca)
    const handleCerrarFormulario = () => {
        dispatch({ type: "CERRAR_MODAL" });
    };

    // Guarda lo que se escribe en cada input del formulario
    const cachearFormulario = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, name } = event.target;

        dispatch({
            type: "SET_CAMPO_FORM",
            payload: {
                field: name as keyof EscuelasTipado["formulario"],
                value: value
            }
        });
    };

    // Carga la escuela elegida en el formulario y abre el modal en modo edición
    const cacharFormularioPut = (escuela: EscuelaListadoRow) => {
        dispatch({ type: "CARGAR_ESCUELA_EDICION", payload: escuela });
        dispatch({ type: "ID_ESCUELA", payload: escuela.id_escuela });
        dispatch({ type: "ABRIR_MODAL", payload: "PUT" });
    };

    // Guarda el archivo elegido (solo si es una imagen) para la vista previa
    const handleCambioImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0] || null;

        if (state.metodo === "PUT") {
            dispatch({ type: "SET_IMAGEN_MOD", payload: true });
        }

        if (archivo) {
            if (archivo.type.startsWith("image/")) {
                dispatch({ type: "SET_IMAGEN", payload: archivo });
            } else {
                alert("Por favor, seleccioná un archivo de imagen válido.");
            }
        } else {
            dispatch({ type: "SET_IMAGEN", payload: null });
        }
    };

    // Libera de memoria la URL temporal de la vista previa cuando cambia
    useEffect(() => {
        return () => {
            // Solo revocamos si es una URL local (blob:), no la que viene del servidor
            if (urlVistaPrevia && urlVistaPrevia.startsWith("blob:")) {
                URL.revokeObjectURL(urlVistaPrevia);
            }
        };
    }, [urlVistaPrevia]);

    // ---------- Llamadas al servicio (POST / PUT) ----------

    const handlePostEscuelas = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        // 1. Valores planos para validar más cómodamente
        const dni = state.formulario.dni_propietario.value.trim();
        const nombre = state.formulario.nombre_propietario.value.trim();
        const apellido = state.formulario.apellido_propietario.value.trim();
        const razonSocial = state.formulario.razon_social.value.trim();
        const direccion = state.formulario.direccion.value.trim();
        const celular = state.formulario.celular.value.trim();
        const logo = state.imagen.imagen; // File o null

        // 2. Validaciones obligatorias
        if (!dni || !nombre || !apellido || !razonSocial || !direccion || !celular) {
            dispatch({ type: "ERROR_GENERICO", payload: "Todos los campos son obligatorios." });
            return;
        }

        if (isNaN(Number(dni)) || isNaN(Number(celular))) {
            dispatch({ type: "ERROR_GENERICO", payload: "El DNI y el celular deben ser valores numéricos válidos." });
            return;
        }

        // En el alta la imagen es obligatoria
        if (!logo) {
            dispatch({ type: "ERROR_GENERICO", payload: "Debes seleccionar una imagen o logo para la academia." });
            return;
        }

        // 3. Payload listo para enviar
        const payloadEscuela = {
            dni_propietario: Number(dni),
            nombre_propietario: nombre,
            apellido_propietario: apellido,
            razon_social: razonSocial,
            direccion: direccion,
            celular: celular,
            imagen: logo
        };

        try {
            dispatch({ type: "SET_CARGA", payload: true });
            const postEscuelas = config.servicios.postEscuelas;

            const resultPostEscuelas = await postEscuelas(payloadEscuela);

            // Alta correcta: limpia el formulario y recarga el listado
            if (resultPostEscuelas.code === "ESCUELA_POST_OK") {
                dispatch({ type: "RESET_FORM" });
                dispatch({ type: "ACTUALIZAR" });
            };

            // Errores conocidos del backend: se muestran en el formulario
            if (
                resultPostEscuelas.code === "FORMATO_IMAGEN_INVALIDO" ||
                resultPostEscuelas.code === "TAMANO_IMAGEN_INVALIDO" ||
                resultPostEscuelas.code === "ERROR_SUBIR_IMAGEN" ||
                resultPostEscuelas.code === "DNI_RAZON_SOCIAL_EXISTENTE"
            ) {
                dispatch({ type: "ERROR_GENERICO", payload: resultPostEscuelas.message });
            };

        } catch (error) {
            dispatch({ type: "ERROR_GENERICO", payload: "Error en el servidor, intente mas tarde." });
        } finally {
            dispatch({ type: "SET_CARGA", payload: false });
        };
    };

    const handlePutEscuelas = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        // 1. Valores planos para validar más cómodamente
        const id_escuela = state.id_escuela;
        const dni = state.formulario.dni_propietario.value.trim();
        const nombre = state.formulario.nombre_propietario.value.trim();
        const apellido = state.formulario.apellido_propietario.value.trim();
        const razonSocial = state.formulario.razon_social.value.trim();
        const direccion = state.formulario.direccion.value.trim();
        const celular = state.formulario.celular.value.trim();
        const logo = state.imagen.imagen; // File o null (null = no cambió la imagen)

        // 2. Validaciones obligatorias (acá la imagen NO es obligatoria)
        if (!dni || !nombre || !apellido || !razonSocial || !direccion || !celular) {
            dispatch({ type: "ERROR_GENERICO", payload: "Todos los campos son obligatorios." });
            return;
        }

        if (isNaN(Number(dni)) || isNaN(Number(celular))) {
            dispatch({ type: "ERROR_GENERICO", payload: "El DNI y el celular deben ser valores numéricos válidos." });
            return;
        }

        // 3. Payload listo para enviar
        const datos: PutEscuelasInputs = {
            id_escuela: id_escuela,
            dni_propietario: Number(dni),
            nombre_propietario: nombre,
            apellido_propietario: apellido,
            razon_social: razonSocial,
            direccion: direccion,
            celular: celular,
            imagen: logo,
            imagenMod: state.imagen.modificado ?? false
        };

        try {
            dispatch({ type: "SET_CARGA", payload: true });
            const putEscuela = config.servicios.putEscuelas;

            const resultPutEscuela = await putEscuela(datos);

            // Edición correcta: limpia el formulario y recarga el listado
            if (resultPutEscuela.code === "ESCUELA_UPDATE_OK") {
                dispatch({ type: "RESET_FORM" });
                dispatch({ type: "ACTUALIZAR" });
            };

            if (resultPutEscuela.code === "DNI_RAZON_SOCIAL_EXISTENTE") {
                dispatch({ type: "ERROR_GENERICO", payload: resultPutEscuela.message });
            };

        } catch (error) {
            dispatch({ type: "ERROR_GENERICO", payload: "Error en el servidor, intente mas tarde." });
        } finally {
            dispatch({ type: "SET_CARGA", payload: false });
        };
    };

    /* ======================================================================
       2. CAMBIO DE ESTADO (alta / baja)
       ====================================================================== */

    // ---------- Cachear información del modal de estado ----------

    // Guarda qué escuela se va a cambiar y en qué estado está hoy,
    // luego abre el modal. El estado actual define si la acción es "alta" o "baja".
    const handleAbirModalEstado = (escuela: EscuelaListadoRow) => {
        dispatch({ type: "ID_ESCUELA", payload: escuela.id_escuela });
        dispatch({
            type: "SET_ESTADO_LISTADO",
            payload: escuela.baja === "activos" ? "activos" : "inactivos"
        });
        dispatch({ type: "SET_MODAL_ESTADO", payload: true });
    };

    // Cierra el modal y reinicia estadoListado + errorEstado en un solo paso
    const handleCerrarModalEstado = () => {
        dispatch({ type: "CERRAR_MODAL_ESTADO" });
    };

    // ---------- Llamada al servicio (cambio de estado) ----------

    const handleEstadoEscuelas = async () => {

        if (!state.id_escuela) {
            dispatch({ type: "ERROR_ESTADO", payload: "No hay escuela seleccionada" });
            return;
        }

        if (state.estadoListado !== "activos" && state.estadoListado !== "inactivos") {
            dispatch({ type: "ERROR_ESTADO", payload: "Estado inválido: debe ser 'activos' o 'inactivos'" });
            return;
        };

        try {
            dispatch({ type: "SET_CARGA", payload: true });

            // Se envía el estado contrario al actual
            const data = {
                id_escuela: state.id_escuela,
                estado: state.estadoListado === "activos" ? "inactivos" : "activos"
            };

            const estadoEscuela = config.servicios.estadoEscuelas;

            const resultEstadoEscuela = await estadoEscuela(data);

            // Cambio correcto: cierra el modal y recarga el listado
            if (resultEstadoEscuela.code === "CAMBIO_ESTADO_ESCUELA") {
                dispatch({ type: "CERRAR_MODAL_ESTADO" });
                dispatch({ type: "ACTUALIZAR" });
            } else {
                dispatch({
                    type: "ERROR_ESTADO",
                    payload: resultEstadoEscuela.message || "No se pudo cambiar el estado de la escuela."
                });
            };

        } catch (error) {
            dispatch({ type: "ERROR_ESTADO", payload: "Error al cambiar el estado de la escuela." });
        } finally {
            dispatch({ type: "SET_CARGA", payload: false });
        };
    };

    /* ======================================================================
       3. LISTADO
       ====================================================================== */

    // ---------- Cachear información del listado ----------

    // Cambia de página (el useEffect de abajo vuelve a pedir los datos)
    const cachearPagina = (pagina: number) => {
        dispatch({ type: "SET_PAGINACION", payload: { pagina } });
    };

    // ---------- Llamada al servicio (listado) ----------

    // Parámetros que se envían a getEscuelas
    const parametrosListado = {
        apellido: state.filtros.apellido.value,
        dni: "",
        razon_social: state.filtros.razon_social.value,
        estado: state.filtros.estado,
        pagina: state.paginacion.pagina,
        limit: state.paginacion.limite,
        offset: (state.paginacion.pagina - 1) * state.paginacion.limite,
    };

    // Pide el listado al montar y cada vez que cambia algo de las dependencias
    useEffectServicio<any, any, EscuelasAction>({
        dispatch: dispatch,
        servicios: config.servicios.getEscuelas,
        valores: parametrosListado,
        accionResultado: (resultado) => ({ type: "SET_LISTADO_ESCUELA", payload: resultado }),
        accionPaginacion: (paginacion) => ({ type: "SET_PAGINACION", payload: paginacion }),
        accionCarga: (carga) => ({ type: "SET_CARGA_LISTADO", payload: carga }),
        accionError: (mensaje) => ({ type: "ERROR_GENERICO_LISTADO", payload: mensaje }),
        useAbort: true,
        dependencias: [
            state.actualizar,        // se incrementa tras un alta, edición o cambio de estado
            state.filtros,           // cualquier cambio en el buscador
            state.paginacion.pagina  // cambio de página
        ]
    });

    /* ======================================================================
       4. FILTROS
       ====================================================================== */

    // ---------- Cachear información del buscador ----------

    // Sirve para los inputs de texto (apellido, razon_social) y para el select de estado
    const cachearFiltros = (
        event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { value, name } = event.target;

        dispatch({
            type: "SET_CAMPO_FILTRO",
            payload: {
                field: name as keyof EscuelasTipado["filtros"],
                // El select vacío ("Estados") se guarda como null, no como ""
                value: name === "estado" ? (value || null) : value
            }
        });

        // Al filtrar siempre se vuelve a la primera página
        dispatch({ type: "SET_PAGINACION", payload: { pagina: 1 } });
    };

    /* ======================================================================
       RETORNO (agrupado en el mismo orden)
       ====================================================================== */

    return {
        state,

        // 1. Formulario (POST / PUT)
        hanldeAbrirPostFormulario,
        handleCerrarFormulario,
        cachearFormulario,
        cacharFormularioPut,
        handleCambioImagen,
        handlePostEscuelas,
        handlePutEscuelas,

        // 2. Cambio de estado
        handleAbirModalEstado,
        handleCerrarModalEstado,
        handleEstadoEscuelas,

        // 3. Listado
        cachearPagina,

        // 4. Filtros
        cachearFiltros,
    }

};