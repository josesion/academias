import { useReducer } from "react";
import {
    AnunciosReducers,
    initialAnuncios,
    type AnunciosAction,
    type CampoFormularioKey,
} from "../../reducers/anuncios.reducer";
import { useEffectServicio } from "../../utils/useEfectServicio";
import type {
    FilaAnuncio,
    FiltrosAnunciosQuery,
    TipoContacto,
} from "../../servicio/anuncios.fetch";
// Empresas del selector: mismo tipo que devuelve el listado de empresas
import type { FilaEmpresa, FiltrosEmpresasQuery } from "../../servicio/empresas.fetch";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

/** Tope del selector de empresas: es el `max(100)` del `limit` de
 *  `EsquemaEmpresaLista`. Con más de 100 empresas activas el selector se
 *  quedaría corto (misma limitación que el selector de escuelas con
 *  `esc_plan_list`). Pendiente anotado en la spec 017. */
const LIMITE_EMPRESAS = 100;

interface PropsAnuncios {
    servicios: {
        listaAnuncios: ServicioCrud,
        postAnuncio: ServicioCrud,
        putAnuncio: ServicioCrud,
        deleteAnuncio: ServicioCrud,
        listaEmpresas: ServicioCrud,
    },
};

/** Campos obligatorios del formulario. En el ALTA se suma la media: el server
 *  responde 400 `MEDIA_AUSENTE` sin archivo, así que se valida antes de pedir
 *  nada para no subir un FormData vacío. */
const CAMPOS_OBLIGATORIOS: { campo: CampoFormularioKey; etiqueta: string }[] = [
    { campo: "id_empresa", etiqueta: "la empresa" },
    { campo: "titulo", etiqueta: "el título" },
    { campo: "descripcion", etiqueta: "la descripción" },
];

/** Los 3 valores que acepta el server. El select solo ofrece estos, pero se
 *  revalida igual: si alguno llegara raro, el `enum` de Zod lo rechaza con 400. */
const TIPOS_CONTACTO: TipoContacto[] = ["whatsapp", "facebook", "instagram"];

/**
 * Lógica de la pantalla de Anuncios: el listado paginado con sus 5 filtros,
 * las empresas del selector y el alta / modificación / baja.
 *
 * @param config - Servicios inyectados desde `hookNegocios/abmAnuncios.ts`.
 * @returns `state` del reducer + todos los handlers de la pantalla.
 */
export const useLogicaAnuncios = (config: PropsAnuncios) => {

    const [state, dispatch] = useReducer(AnunciosReducers, initialAnuncios());

    /* ======================================================================
       1. LISTADO (GET /api/anuncio_lista)

       `filtros` entra en dependencias: cada objeto nuevo (página, razón social,
       tipo de media, tipo de contacto, desde/hasta) dispara un request nuevo.
       ====================================================================== */

    useEffectServicio<FiltrosAnunciosQuery, FilaAnuncio[], AnunciosAction>({
        dispatch,
        servicios: config.servicios.listaAnuncios,
        valores: state.filtros,
        // El 204 (`SIN_ANUNCIOS`) llega como `data: null`: es lista vacía
        accionResultado: (filas) => ({ type: "SET_LISTADO", payload: filas ?? [] }),
        accionCarga:     (carga) => ({ type: "SET_CARGA", payload: { bloque: "listado", valor: carga } }),
        accionError:     (msg)   => ({ type: "SET_ERROR", payload: { bloque: "listado", valor: msg } }),
        accionPaginacion:(p)     => ({ type: "SET_PAGINACION", payload: p }),
        useAbort: true,
        dependencias: [state.filtros, state.actualizar],
    });

    /* ======================================================================
       2. EMPRESAS DEL SELECTOR (GET /api/empresa_lista)

       Se piden UNA sola vez al montar (`dependencias: []`): no dependen de
       ningún filtro. Se piden sin `estado` para que el server traiga las
       activas (las dadas de baja no pueden recibir anuncios nuevos).
       ====================================================================== */

    useEffectServicio<FiltrosEmpresasQuery, FilaEmpresa[], AnunciosAction>({
        dispatch,
        servicios: config.servicios.listaEmpresas,
        valores: { pagina: 1, limit: LIMITE_EMPRESAS },
        accionResultado: (filas) => ({ type: "SET_EMPRESAS", payload: filas ?? [] }),
        accionCarga:     (carga) => ({ type: "SET_CARGA", payload: { bloque: "opciones", valor: carga } }),
        accionError:     (msg)   => ({ type: "SET_ERROR", payload: { bloque: "opciones", valor: msg } }),
        // Sin accionPaginacion: al selector no le interesa la paginación
        useAbort: true,
        dependencias: [],
    });

    /**
     * Cambia de página: el número vive en dos lados y hay que mover los dos en
     * el mismo evento (React agrupa → un solo request).
     *
     * @param pagina - Página a pedir.
     */
    const cachearPagina = (pagina: number) => {
        dispatch({ type: "SET_CAMPO_FILTRO", payload: { campo: "pagina", valor: pagina } });
        dispatch({ type: "SET_PAGINACION", payload: { pagina } });
    };

    /**
     * Busca por razón social de la empresa (parcial: el server usa
     * `LIKE %…%`). Vacío = sin filtro.
     *
     * @param event - ChangeEvent del input de búsqueda.
     */
    const cambiarRazonSocial = (event: React.ChangeEvent<HTMLInputElement>) => {
        const razon_social = event.target.value.trim() || undefined;

        dispatch({ type: "SET_CAMPO_FILTRO", payload: { campo: "razon_social", valor: razon_social } });
        dispatch({ type: "ACTUALIZAR" });
    };

    /**
     * Filtra por tipo de media. "Todas" se manda como `tipo_media` sin definir:
     * en `anuncios` no hay ningún `default()` que lo llene, así que omitirlo es
     * lo mismo que no filtrar.
     *
     * @param event - ChangeEvent del `<select>` de tipo de media.
     */
    const cambiarTipoMedia = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const valor = event.target.value;
        const tipo_media = valor === "imagen" || valor === "video" ? valor : undefined;

        dispatch({ type: "SET_CAMPO_FILTRO", payload: { campo: "tipo_media", valor: tipo_media } });
        dispatch({ type: "ACTUALIZAR" });
    };

    /**
     * Filtra por tipo de contacto. Mismo criterio que el tipo de media.
     *
     * @param event - ChangeEvent del `<select>` de tipo de contacto.
     */
    const cambiarTipoContacto = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const valor = event.target.value;
        const tipo_contacto = TIPOS_CONTACTO.includes(valor as TipoContacto)
            ? (valor as TipoContacto)
            : undefined;

        dispatch({ type: "SET_CAMPO_FILTRO", payload: { campo: "tipo_contacto", valor: tipo_contacto } });
        dispatch({ type: "ACTUALIZAR" });
    };

    /**
     * Cambia una de las dos fechas del filtro (las del `FiltroFechas`).
     *
     * El server exige `AAAA-MM-DD`, que es justo lo que entrega el
     * `input[type=date]`. Vacío = sin filtro.
     *
     * @param campo - `"fecha_desde"` o `"fecha_hasta"`.
     * @param event - ChangeEvent del input de fecha.
     */
    const cambiarFecha = (
        campo: "fecha_desde" | "fecha_hasta",
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const fecha = event.target.value || undefined;

        dispatch({ type: "SET_CAMPO_FILTRO", payload: { campo, valor: fecha } });
        dispatch({ type: "ACTUALIZAR" });
    };

    // Vuelve los filtros y la paginación a la configuración de fábrica
    const limpiarFiltros = () => {
        dispatch({ type: "RESET_FILTROS" });
    };

    /* ======================================================================
       3. FORMULARIO (POST /api/anuncio_alta · PUT /api/anuncio_mod)
       ====================================================================== */

    // Abre el modal en blanco (form de fábrica, sin media)
    const abrirFormulario = () => {
        dispatch({ type: "ABRIR_MODAL" });
    };

    /**
     * Abre el modal en MODIFICACIÓN con la fila clickeada ya cargada: precarga
     * las 4 celdas y setea `metodo: "PUT"` + el `id_anuncio`. La media queda
     * en `null`, que en el PUT significa "no toques la media actual".
     *
     * @param fila - Fila de la lista a editar.
     */
    const abrirModificacion = (fila: FilaAnuncio) => {
        dispatch({ type: "CARGAR_ANUNCIO_EDICION", payload: fila });
    };

    // Cierra el modal y limpia form, error, carga, media, metodo e id_anuncio
    const cerrarFormulario = () => {
        dispatch({ type: "CERRAR_MODAL" });
    };

    /**
     * Guarda lo que se escribe / se elige en UNA celda del formulario.
     * La misma función sirve para los `<Inputs>`, el `<SelectorOpt>` y el
     * `<textarea>` de la descripción.
     *
     * @param event - ChangeEvent del campo del formulario.
     */
    const cachearFormulario = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
     * Guarda el archivo de media elegido. `null` cuando se elige ninguno.
     *
     * @param event - ChangeEvent del input de archivo.
     */
    const cambiarMedia = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: "SET_MEDIA", payload: event.target.files?.[0] ?? null });
    };

    /**
     * Deselecciona la media nueva y vuelve a la que ya estaba.
     *
     * @param event - Click del botón "Quitar".
     */
    const quitarMedia = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        dispatch({ type: "SET_MEDIA", payload: null });
    };

    /**
     * Alta de un anuncio (POST /api/anuncio_alta).
     *
     * 1. Valida campos vacíos y que haya media (el server responde 400
     *    `MEDIA_AUSENTE` sin archivo), y corta sin pedir nada.
     * 2. Manda `id_empresa`, título, descripción, tipo de contacto y el
     *    archivo. **No manda `tipo_media`**: lo deduce el server del
     *    `mimetype`.
     * 3. Si sale bien: cierra el modal y refresca. Si no: el aviso queda en
     *    `error.formulario` y el modal sigue abierto.
     *
     * @param event - Click del botón "Guardar".
     */
    const postAnuncio = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const f = state.formulario;
        const faltantes = CAMPOS_OBLIGATORIOS.filter((c) => !f[c.campo].value.trim());

        if (faltantes.length > 0) {
            dispatch({
                type: "SET_ERROR",
                payload: {
                    bloque: "formulario",
                    valor: `Completá ${faltantes.map((c) => c.etiqueta).join(", ")}.`,
                },
            });
            return;
        }

        // En el alta la media es obligatoria (MEDIA_AUSENTE, 400)
        if (!state.media) {
            dispatch({
                type: "SET_ERROR",
                payload: { bloque: "formulario", valor: "Adjuntá una imagen o un video." },
            });
            return;
        }

        try {
            dispatch({ type: "SET_ERROR", payload: { bloque: "formulario", valor: null } });
            dispatch({ type: "SET_CARGA", payload: { bloque: "formulario", valor: true } });

            const resultado = await config.servicios.postAnuncio({
                id_empresa: Number(f.id_empresa.value),
                titulo: f.titulo.value.trim(),
                descripcion: f.descripcion.value.trim(),
                tipo_contacto: f.tipo_contacto.value as TipoContacto,
                media: state.media,
            });

            if (resultado.code === "ANUNCIO_ALTA_OK") {
                // ✅ creado: cierra y refresca desde la página 1
                dispatch({ type: "CERRAR_MODAL" });
                dispatch({ type: "ACTUALIZAR" });

            } else if (resultado.code === "FORMATO_MEDIA_INVALIDO" ||
                       resultado.code === "TAMANO_MEDIA_INVALIDO") {
                // 400 del archivo: el server ya manda el mensaje exacto (distingue
                // el tope de imagen del de video)
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "El archivo no tiene un formato o tamaño válido." }});

            } else if (resultado.code === "EMPRESA_NO_ENCONTRADA") {
                // 404: el id de empresa no existe
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "No existe una empresa con ese id." }});

            } else {
                // 400 de Zod, 403 si no es admin, 500, red caída…
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "No se pudo crear el anuncio." }});
            }

        } catch {
            // Red de seguridad: apiFetch nunca lanza, esto es por si falla algo nuestro
            dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                valor: "No se pudo procesar la operación, intente de nuevo." } });

        } finally {
            dispatch({ type: "SET_CARGA", payload: { bloque: "formulario", valor: false } });
        }
    };

    /**
     * Modificación de un anuncio (PUT /api/anuncio_mod).
     *
     * 1. Valida SOLO los 3 campos de texto. **La media es opcional**: si no se
     *    eligió una, el FormData viaja sin el campo y el server conserva la
     *    actual (el `cambia_media` lo pone el controlador, no el front).
     * 2. Manda `id_anuncio` + los 4 campos + la media solo si hay.
     * 3. Si sale bien: cierra el modal y refresca. Si no: el aviso queda en
     *    `error.formulario` y el modal sigue abierto.
     *
     * @param event - Click del botón "Guardar cambios".
     */
    const putAnuncio = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const f = state.formulario;
        const faltantes = CAMPOS_OBLIGATORIOS.filter((c) => !f[c.campo].value.trim());

        if (faltantes.length > 0) {
            dispatch({
                type: "SET_ERROR",
                payload: {
                    bloque: "formulario",
                    valor: `Completá ${faltantes.map((c) => c.etiqueta).join(", ")}.`,
                },
            });
            return;
        }

        try {
            dispatch({ type: "SET_ERROR", payload: { bloque: "formulario", valor: null } });
            dispatch({ type: "SET_CARGA", payload: { bloque: "formulario", valor: true } });

            const resultado = await config.servicios.putAnuncio({
                id_anuncio: state.id_anuncio ?? 0,
                id_empresa: Number(f.id_empresa.value),
                titulo: f.titulo.value.trim(),
                descripcion: f.descripcion.value.trim(),
                tipo_contacto: f.tipo_contacto.value as TipoContacto,
                // Sin archivo = el server conserva la media actual
                media: state.media,
            });

            if (resultado.code === "ANUNCIO_MOD_OK") {
                // ✅ modificación hecha: cierra y refresca
                dispatch({ type: "CERRAR_MODAL" });
                dispatch({ type: "ACTUALIZAR" });

            } else if (resultado.code === "FORMATO_MEDIA_INVALIDO" ||
                       resultado.code === "TAMANO_MEDIA_INVALIDO") {
                // 400 del archivo
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "El archivo no tiene un formato o tamaño válido." }});

            } else if (resultado.code === "ANUNCIO_NO_ENCONTRADO" ||
                       resultado.code === "MODIFICAR_NOT_FOUND" ||
                       resultado.code === "EMPRESA_NO_ENCONTRADA") {
                // 404: el anuncio o la empresa ya no existen
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "No existe el registro que intentás modificar." }});

            } else {
                // 400 de Zod, 403, 500, red caída…
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "No se pudo modificar el anuncio." }});
            }

        } catch {
            // Red de seguridad: apiFetch nunca lanza, esto es por si falla algo nuestro
            dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                valor: "No se pudo procesar la operación, intente de nuevo." } });

        } finally {
            dispatch({ type: "SET_CARGA", payload: { bloque: "formulario", valor: false } });
        }
    };

    /* ======================================================================
       4. BAJA FÍSICA (DELETE /api/anuncio_baja)
       ====================================================================== */

    /**
     * Abre la confirmación de baja con la fila cacheada. La leyenda del
     * `EliminarVentana` avisa que el archivo se borra de verdad.
     *
     * @param fila - Fila de la lista a borrar.
     */
    const abrirEliminar = (fila: FilaAnuncio) => {
        dispatch({ type: "ABRIR_ELIMINAR", payload: fila });
    };

    // Cierra la confirmación sin borrar nada
    const cerrarEliminar = () => {
        dispatch({ type: "CERRAR_ELIMINAR" });
    };

    /**
     * Confirma la baja: se borra la fila **y el archivo de R2**. No hay vuelta
     * atrás, por eso el `EliminarVentana` lo pide explícitamente.
     *
     * Cierra el modal y refresca desde la página 1. El aviso va a
     * `error.eliminar`, que el `EliminarVentana` muestra adentro.
     *
     * @param fila - Fila que se está por borrar.
     */
    const deleteAnuncio = async (fila: FilaAnuncio) => {
        try {
            dispatch({ type: "SET_ERROR", payload: { bloque: "eliminar", valor: null } });
            dispatch({ type: "SET_CARGA", payload: { bloque: "eliminar", valor: true } });

            const resultado = await config.servicios.deleteAnuncio({
                id_anuncio: fila.id_anuncio,
            });

            if (resultado.code === "ANUNCIO_BAJA_OK") {
                // ✅ borrado: cierra y refresca
                dispatch({ type: "CERRAR_ELIMINAR" });
                dispatch({ type: "ACTUALIZAR" });

            } else if (resultado.code === "ANUNCIO_NO_ENCONTRADO" ||
                       resultado.code === "ELIMINAR_NOT_FOUND") {
                // 404: pasa si ya se había borrado; el resultado final es el mismo
                dispatch({ type: "CERRAR_ELIMINAR" });
                dispatch({ type: "ACTUALIZAR" });

            } else {
                // 403 si no es admin, 500, red caída…
                dispatch({ type: "SET_ERROR", payload: { bloque: "eliminar",
                    valor: resultado.message || "No se pudo eliminar el anuncio." }});
            }

        } catch {
            // Red de seguridad: apiFetch nunca lanza, esto es por si falla algo nuestro
            dispatch({ type: "SET_ERROR", payload: { bloque: "eliminar",
                valor: "No se pudo procesar la operación, intente de nuevo." } });

        } finally {
            dispatch({ type: "SET_CARGA", payload: { bloque: "eliminar", valor: false } });
        }
    };

    return {
        state,

        // Listado y filtros
        cachearPagina,
        cambiarRazonSocial,
        cambiarTipoMedia,
        cambiarTipoContacto,
        cambiarFecha,
        limpiarFiltros,

        // Formulario: alta (POST) y modificación (PUT)
        abrirFormulario,
        abrirModificacion,
        cerrarFormulario,
        cachearFormulario,
        cambiarMedia,
        quitarMedia,
        postAnuncio,
        putAnuncio,

        // Baja física
        abrirEliminar,
        cerrarEliminar,
        deleteAnuncio,
    };
};