import { useReducer } from "react";
import { SuspcripcionesReducers, initialSuspcripciones, type SuspcripcionesAction, type CampoFormularioKey, type CampoFiltroLogsKey } from "../../reducers/suspcripciones";
import { useEffectServicio } from "../../utils/useEfectServicio";
import type { SuscripcionEscuelaDto, FiltrosSuscripcionesInputs, EscPlanDTO, MetricasSimples} from "../../servicio/suspcripciones.fetch";
import type { FilaLogEventos, FiltrosQuery, MarcarLogEventosInput } from "../../servicio/logs.fetch";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;
interface PropsSuscripciones {

    servicios :{
        getEscuelas: ServicioCrud,
        postSusp: ServicioCrud,
        getEscPlanes : ServicioCrud,
        putEstadoSuspc : ServicioCrud,
        metricasSuspcripcion : ServicioCrud,
        listaLogs: ServicioCrud,
        putLogs: ServicioCrud,
    },

};

// PascalCase igual que EscuelasLogica: ESLint (rules-of-hooks) solo acepta
// funciones "use*" o PascalCase cuando se les llama desde otro archivo
export const SuscripcionesLogica = (  config : PropsSuscripciones) =>{

    const [state, dispatch] = useReducer(SuspcripcionesReducers, initialSuspcripciones());

    /**
     * Cambia de página del listado: el número vive en dos lados y hay que
     * mover los dos en el mismo evento (React 18 agrupa → un solo request).
     *
     * 1. `SET_CAMPO_FILTRO pagina` — la que viaja al server (?pagina=N):
     *    al crearse un objeto de filtros nuevo, el effect se dispara.
     * 2. `SET_PAGINACION` — la que pinta el paginador.
     *
     * @param pagina - Página a pedir.
     */
    const cachearPagina = (pagina: number) => {
        dispatch({ type: "SET_CAMPO_FILTRO", payload: { campo: "pagina", valor: pagina } });
        dispatch({ type: "SET_PAGINACION", payload: { pagina } });
    };    

    /**
     * Cambia el filtro de estado del listado y lo refresca (2 despachadas
     * batched → un solo request):
     *
     * - `SET_CAMPO_FILTRO estado`: lo que viaja al server ("" vacío = todos:
     *   el schema del server lo convierte en '%%' y la SQL no filtra).
     * - `ACTUALIZAR`: refresca y vuelve a la página 1 (resetea
     *   `filtros.pagina` y `paginacion.pagina` en el reducer).
     *
     * @param event - ChangeEvent del <select> de estado.
     */
    const cambiarFiltroEstado = (event: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch({ type: "SET_CAMPO_FILTRO", payload: { campo: "estado", valor: event.target.value } });
        dispatch({ type: "ACTUALIZAR" });
    };

    useEffectServicio<FiltrosSuscripcionesInputs, SuscripcionEscuelaDto[], SuspcripcionesAction>({
        dispatch,
        servicios: config.servicios.getEscuelas,
        valores: state.filtroSuscripciones,
        accionResultado: (r) => ({ type: "SET_LISTADO_SUSCRIPCION", payload: r }),
        accionCarga:    (c) => ({ type: "SET_CARGA", payload: { campo: "listado", valor: c } }),
        accionError:    (m) => ({ type: "SET_ERROR", payload: { campo: "listado", valor: m } }),
        accionPaginacion:(p)=> ({ type: "SET_PAGINACION", payload: p }),
        useAbort: true,
        // `actualizar` entra en deps: al subir (alta/anulación/filtro) se
        // vuelve a pedir desde la página 1 sin pisar los otros filtros
        dependencias: [state.filtroSuscripciones, state.actualizar],
    });




    /* ======================================================================
       1. FORMULARIO (POST / PUT)

       Opciones de los dos selects (escuelas activas + planes SaaS activos):
       se piden al abrir el modal. El alta se hace con `postSuscripcion`.
       ====================================================================== */

    useEffectServicio<undefined, EscPlanDTO, SuspcripcionesAction>({
        dispatch,
        servicios: config.servicios.getEscPlanes,
        // getEscPlanes no recibe parámetros: no hay valores que mandarle
        accionResultado: (opciones) => ({ type: "SET_OPCIONES", payload: opciones }),
        accionCarga:     (carga)    => ({ type: "SET_CARGA", payload: { campo: "opciones", valor: carga } }),
        accionError:     (mensaje)  => ({ type: "SET_ERROR", payload: { campo: "opciones", valor: mensaje } }),
        // Sin accionPaginacion: la respuesta de esc_plan_list no trae paginación
        useAbort: true,
        // `enabled` entra solo en el array de dependencias del util:
        // un solo pedido por apertura, abortado a los 8 s si no responde
        enabled: state.modal.formulario,
        dependencias: [],
    });

    /* ======================================================================
       5. MÉTRICAS — tarjetas del panel (GET /api/metricas_simples)

       Se piden al montar y vuelven a pedirse con cada `ACTUALIZAR`:
       el alta y la anulación lo mandan, así que las tarjetas se solas
       al crear o anular una suscripción.
       ====================================================================== */

    useEffectServicio<undefined, MetricasSimples, SuspcripcionesAction>({
        dispatch,
        servicios: config.servicios.metricasSuspcripcion,
        // metricasSuspcripcion no recibe parámetros
        accionResultado: (metricas) => ({ type: "SET_METRICAS", payload: metricas }),
        accionCarga:     (carga)     => ({ type: "SET_CARGA", payload: { campo: "metricas", valor: carga } }),
        accionError:     (mensaje)   => ({ type: "SET_ERROR", payload: { campo: "metricas", valor: mensaje } }),
        // Sin accionPaginacion: la respuesta no trae paginación
        useAbort: true,
        dependencias: [state.actualizar],
    });

    /* ======================================================================
       6. EVENTOS — bitácora del sistema (GET /api/logs_eventos)

       `useEffectServicio` sirve tal cual porque el "no hay eventos" del server
       es un **204** (no un 404): cae en la rama 2xx y despacha
       `SET_LISTADO_LOGS` con `null` sin tocar `error.logs`. Con `null` el
       reducer además resetea la paginación, porque esa respuesta no la trae.
       ====================================================================== */

    useEffectServicio<FiltrosQuery, FilaLogEventos[], SuspcripcionesAction>({
        dispatch,
        servicios: config.servicios.listaLogs,
        valores: state.filtroLogs,
        accionResultado: (filas) => ({ type: "SET_LISTADO_LOGS", payload: filas }),
        accionCarga:     (carga)    => ({ type: "SET_CARGA", payload: { campo: "logs", valor: carga } }),
        accionError:     (mensaje)  => ({ type: "SET_ERROR", payload: { campo: "logs", valor: mensaje } }),
        accionPaginacion:(p)        => ({ type: "SET_PAGINACION_LOGS", payload: p }),
        useAbort: true,
        // `actualizarLogs` entra en deps: al subir (marcar un evento o
        // cambiar un filtro) se vuelve a pedir desde la página 1
        dependencias: [state.filtroLogs, state.actualizarLogs],
    });

    /**
     * Cambia cualquier filtro de la bitácora y la refresca (2 despachadas
     * batched → un solo request):
     *
     * - `SET_CAMPO_FILTRO_LOGS`: el `name` del control como campo y su `value`
     *   como valor. Los selects mandan texto, así que `resuelto` (que viaja
     *   como número) se castea; el "Todos" llega como `""` y se guarda como
     *   `undefined`, que es lo único que `listaLogs` NO manda al server.
     * - `ACTUALIZAR_LOGS`: refresca y vuelve a la página 1.
     *
     * @param event - ChangeEvent del <select> o del <input> del filtro.
     */
    const cambiarFiltroLogs = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = event.target;

        // "Todos" de los selects = sin filtro: `undefined` ("" llegaría al
        // server como 0 en `resuelto` y filtraría solo los pendientes)
        const valor: string | number | undefined =
            name === "resuelto" ? (value === "" ? undefined : Number(value)) : value;

        dispatch({ type: "SET_CAMPO_FILTRO_LOGS", payload: { campo: name as CampoFiltroLogsKey, valor } });
        dispatch({ type: "ACTUALIZAR_LOGS" });
    };

    /**
     * Cambia de página de la bitácora: el número vive en dos lados y hay que
     * mover los dos en el mismo evento (React 18 los agrupa → un solo request).
     *
     * @param pagina - Página a pedir.
     */
    const cachearPaginaLogs = (pagina: number) => {
        dispatch({ type: "SET_CAMPO_FILTRO_LOGS", payload: { campo: "pagina", valor: pagina } });
        dispatch({ type: "SET_PAGINACION_LOGS", payload: { pagina } });
    };

    /**
     * Marca (o desmarca) un evento como revisado (PUT /api/logs_eventos_marcar).
     *
     * Es un **toggle**: el server solo cambia la bandera `resuelto`, así que
     * se le manda el valor contrario al que tiene la fila (0 ↔ 1). El registro
     * no se edita ni se borra nunca.
     *
     * Éxito: refresca la bitácora para repintar la fila. Error: el aviso queda
     * en `error.logs` y la fila sigue como estaba.
     *
     * @param evento - Fila de la bitácora que disparó el botón.
     */
    const marcarLog = async (evento: FilaLogEventos) => {
        try {
            dispatch({ type: "SET_ERROR", payload: { campo: "logs", valor: null } });
            dispatch({ type: "SET_CARGA", payload: { campo: "logs", valor: true } });

            const cuerpo: MarcarLogEventosInput = {
                id_log: evento.id_log,
                resuelto: evento.resuelto === 1 ? 0 : 1,
            };

            const resultado = await config.servicios.putLogs(cuerpo);

            if (resultado.code === "LOG_MARCADO_OK") {
                // la fila se repinta con la bandera nueva
                dispatch({ type: "ACTUALIZAR_LOGS" });

            } else if (resultado.code === "LOG_NO_ENCONTRADO") {

                dispatch({ type: "SET_ERROR", payload: { campo: "logs",
                    valor: "Ese evento ya no existe." }});

            } else {

                dispatch({ type: "SET_ERROR", payload: { campo: "logs",
                    valor: resultado.message || "No se pudo actualizar el evento." }});
            };

        } catch {
            // Red de seguridad: apiFetch nunca lanza, esto es por si falla algo nuestro
            dispatch({ type: "SET_ERROR", payload: { campo: "logs",
                valor: "No se pudo procesar la operación, intente de nuevo." } });

        } finally {
            dispatch({ type: "SET_CARGA", payload: { campo: "logs", valor: false } });
        }
    };

    // Abre el modal en modo alta
    const abrirFormulario = () => {
        dispatch({ type: "ABRIR_MODAL", payload: "POST" });
    };

    /**
     * Abre el modal de anulación cacheando la fila que se va a anular:
     * `seleccionada` guarda de una el id (lo único que pide el fetch),
     * la razón social y el plan (la leyenda del modal).
     *
     * @param suscripcion - Fila del listado que disparó el botón.
     */
    const abrirFormularioAnular = (suscripcion: SuscripcionEscuelaDto) => {
        dispatch({ type: "SET_SELECCIONADA", payload: suscripcion });
        dispatch({ type: "ABRIR_MODAL_ESTADO", payload: true });
    };    


    // Cierra el modal y limpia el formulario (el listado no se toca)
    const cerrarFormulario = () => {
        dispatch({ type: "CERRAR_MODAL" });
    };

     const cerrarFormularioAnular = () => {
     dispatch({ type: "ABRIR_MODAL_ESTADO", payload : false });
    };    

    // Guarda lo que se escribe en cada campo del formulario
    const cachearFormulario = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;

        dispatch({
            type: "SET_CAMPO_FORM",
            payload: {
                campo: name as CampoFormularioKey,
                valor: value,
            },
        });
    };

    /**
     * Alta de una suscripción (POST).
     * 1. Valida que haya academia y plan (el server también valida con Zod).
     * 2. Pide el alta con los dos IDs (fechas y estado los calcula el server).
     * 3. Si sale bien: cierra el modal (limpia el form) y refresca el listado.
     *    Si no: el aviso queda en `error.formulario` y el modal sigue abierto.
     */
    const postSuscripcion = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const id_escuela = state.formulario.id_escuela.value;
        const id_plan_saas = state.formulario.id_plan_saas.value;

        if (!id_escuela || !id_plan_saas) {
            dispatch({
                type: "SET_ERROR",
                payload: { campo: "formulario", valor: "Seleccioná una academia y un plan." },
            });
            return;
        }


        try{
            dispatch({ type: "SET_ERROR", payload: { campo: "formulario", valor: null } });
            dispatch({ type: "SET_CARGA", payload: { campo: "formulario", valor: true } });

            const resultado = await config.servicios.postSusp({
                id_escuela: Number(id_escuela),
                id_plan_saas: Number(id_plan_saas),
            }); 

                if (resultado.code === "SUSCRIPCION_OK") {
                    // ✅ alta creada
                    dispatch({ type: "CERRAR_MODAL" });
                    dispatch({ type: "ACTUALIZAR" });

                } else if (resultado.code === "SUSCRIPCION_ACTIVA") {

                    dispatch({ type: "SET_ERROR", payload: { campo: "formulario",
                        valor: resultado.message || "Esta escuela ya tiene una suscripción activa." }});

                } else {

                    dispatch({ type: "SET_ERROR", payload: { campo: "formulario",
                        valor: resultado.message || "No se pudo crear la suscripción." }});
                };       

        }catch{
                 dispatch({
                    type: "SET_ERROR",
                    payload: { campo: "formulario", valor: "Error servidor, intente de nuevo mas tarde" },
                });           
        }finally{
            dispatch({ type: "SET_CARGA", payload: { campo: "formulario", valor: false } });
        };
    };


    const putSuscripcion = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

    };

    /**
     * Anula la suscripción seleccionada (PUT /api/anular_susp/:id).
     * El server la pasa a "anulado" y responde `SUSCRIPCION_ANULAR_OK`.
     * Éxito: cierra el modal y refresca el listado.
     * Error: el aviso queda en `error.estado` y el modal sigue abierto.
     * (Mismo molde que `postSuscripcion`.)
     */
    const anularSuscripcion = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const id_suscripcion = state.seleccionada?.id_suscripcion;

        if (!id_suscripcion) {
            dispatch({
                type: "SET_ERROR",
                payload: { campo: "estado", valor: "No hay ninguna suscripción seleccionada." },
            });
            return;
        }

        try {
            dispatch({ type: "SET_ERROR", payload: { campo: "estado", valor: null } });
            dispatch({ type: "SET_CARGA", payload: { campo: "estado", valor: true } });

            // El fetch pide solo el número (firma: putEstadoSuspc(id_susp))
            const resultado = await config.servicios.putEstadoSuspc(id_suscripcion);

            if (resultado.code === "SUSCRIPCION_ANULAR_OK") {
                // ✅ cierra el modal y la fila se repinta con estado "anulado"
                dispatch({ type: "ABRIR_MODAL_ESTADO", payload: false });
                dispatch({ type: "ACTUALIZAR" });

            } else {
                // ERROR_SERVIDOR, 404 si ya no existe, sesión vencida, red...
                dispatch({ type: "SET_ERROR", payload: { campo: "estado",
                    valor: resultado.message || "No se pudo anular la suscripción." } });
            }

        } catch {
            // Red de seguridad: apiFetch nunca lanza, esto es por si falla algo nuestro
            dispatch({ type: "SET_ERROR", payload: { campo: "estado",
                valor: "No se pudo procesar la operación, intente de nuevo." } });

        } finally {
            dispatch({ type: "SET_CARGA", payload: { campo: "estado", valor: false } });
        }
    };

    return {
        state,

        // 1. Formulario (POST / PUT)
        abrirFormulario,
        abrirFormularioAnular,
        cerrarFormulario,
        cerrarFormularioAnular,
        cachearFormulario,
        postSuscripcion,
        putSuscripcion,
        anularSuscripcion,
     

        // 3. Listado
        cachearPagina,
        cambiarFiltroEstado,

        // 6. Eventos (bitácora)
        cambiarFiltroLogs,
        cachearPaginaLogs,
        marcarLog,
    }
};
//@
 