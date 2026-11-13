import { useReducer } from "react";
import {
    EmpresasReducers,
    initialEmpresas,
    type EmpresasAction,
    type CampoFormularioKey,
} from "../../reducers/empresas.reducer";
import { useEffectServicio } from "../../utils/useEfectServicio";
import type {
    FilaEmpresa,
    FiltrosEmpresasQuery,
} from "../../servicio/empresas.fetch";
import type { FilaAnuncio } from "../../servicio/anuncios.fetch";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface PropsEmpresas {
    servicios: {
        listaEmpresas: ServicioCrud,
        postEmpresa: ServicioCrud,
        putEmpresa: ServicioCrud,
        deleteEmpresa: ServicioCrud,
        listaAnunciosEmpresa: ServicioCrud,
    },
};

/** Campos obligatorios del formulario. Las 3 redes y el logo son opcionales en
 *  el schema del server; la etiqueta solo se usa para armar el aviso
 *  "Completá …" (decisión de la spec 007: el front solo valida vacíos). */
const CAMPOS_OBLIGATORIOS: { campo: CampoFormularioKey; etiqueta: string }[] = [
    { campo: "razon_social", etiqueta: "la razón social" },
    { campo: "domicilio", etiqueta: "el domicilio" },
];

/**
 * Lógica de la pantalla de Empresas: el listado paginado con sus filtros, el
 * alta / modificación / baja (lógica) y el panel con los anuncios de la
 * empresa clickeada.
 *
 * @param config - Servicios inyectados desde `hookNegocios/abmEmpresas.ts`.
 * @returns `state` del reducer + todos los handlers de la pantalla.
 */
export const useLogicaEmpresas = (config: PropsEmpresas) => {

    const [state, dispatch] = useReducer(EmpresasReducers, initialEmpresas());

    /* ======================================================================
       1. LISTADO (GET /api/empresa_lista)

       `filtros` entra en dependencias: cada objeto nuevo (página, razón
       social, estado) dispara un request nuevo. `actualizar` sube cuando hay
       que refrescar desde la página 1.
       ====================================================================== */

    useEffectServicio<FiltrosEmpresasQuery, FilaEmpresa[], EmpresasAction>({
        dispatch,
        servicios: config.servicios.listaEmpresas,
        valores: state.filtros,
        // `accionResultado` recibe `R | null`: el 204 del server llega como
        // `data: null` y es lista vacía, no error
        accionResultado: (filas) => ({ type: "SET_LISTADO", payload: filas ?? [] }),
        accionCarga:     (carga) => ({ type: "SET_CARGA", payload: { bloque: "listado", valor: carga } }),
        accionError:     (msg)   => ({ type: "SET_ERROR", payload: { bloque: "listado", valor: msg } }),
        accionPaginacion:(p)     => ({ type: "SET_PAGINACION", payload: p }),
        useAbort: true,
        dependencias: [state.filtros, state.actualizar],
    });

    /* ======================================================================
       2. ANUNCIOS DE LA EMPRESA (GET /api/anuncio_lista_empresa)

       Solo corre cuando hay una empresa clickeada (`enabled`). El servicio
       real recibe un número, así que se envuelve para traducir el objeto de
       `valores` a ese número.

       Sin `accionPaginacion`: este listado del server NO trae paginación.
       ====================================================================== */

    useEffectServicio<{ id_empresa: number }, FilaAnuncio[], EmpresasAction>({
        dispatch,
        // El servicio real recibe un número suelto: se traduce el objeto de
        // `valores`. El `?? 0` es por el tipo del `servicios` del util, que
        // declara `data?` opcional (nunca llega undefined: el `enabled` de
        // abajo lo evita).
        servicios: (datos) => config.servicios.listaAnunciosEmpresa(datos?.id_empresa ?? 0),
        valores: { id_empresa: state.empresaSeleccionada?.id_empresa ?? 0 },
        accionResultado: (filas) => ({ type: "SET_LISTADO_ANUNCIOS", payload: filas ?? [] }),
        accionCarga:     (carga) => ({ type: "SET_CARGA", payload: { bloque: "anuncios", valor: carga } }),
        accionError:     (msg)   => ({ type: "SET_ERROR", payload: { bloque: "anuncios", valor: msg } }),
        useAbort: true,
        enabled: Boolean(state.empresaSeleccionada),
        dependencias: [state.empresaSeleccionada?.id_empresa],
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
     * Busca por razón social (parcial: el server usa `LIKE %…%`).
     *
     * Cada tecla genera un objeto de filtros nuevo → un request. No hay
     * debounce en el resto de la app, así que tampoco se agrega acá.
     *
     * Vacío = sin filtro: se manda `undefined` y no se agrega al query.
     *
     * @param event - ChangeEvent del input de búsqueda.
     */
    const cambiarRazonSocial = (event: React.ChangeEvent<HTMLInputElement>) => {
        const razon_social = event.target.value.trim() || undefined;

        dispatch({ type: "SET_CAMPO_FILTRO", payload: { campo: "razon_social", valor: razon_social } });
        dispatch({ type: "ACTUALIZAR" });
    };

    /**
     * Cambia el filtro de estado ("Todas" / "Activas" / "Inactivas").
     *
     * "Todas" se manda como `estado` **sin definir**: sin él el server trae
     * solo las activas, y mandarlo vacío haría que el `enum` lo rechace con 400.
     *
     * @param event - ChangeEvent del `<select>` de estado.
     */
    const cambiarEstado = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const estado = event.target.value || undefined;

        dispatch({ type: "SET_CAMPO_FILTRO", payload: { campo: "estado", valor: estado } });
        dispatch({ type: "ACTUALIZAR" });
    };

    // Vuelve los filtros y la paginación a la configuración de fábrica
    const limpiarFiltros = () => {
        dispatch({ type: "RESET_FILTROS" });
    };

    /* ======================================================================
       3. FORMULARIO (POST /api/empresa_alta · PUT /api/empresa_mod)
       ====================================================================== */

    // Abre el modal en blanco (el form de fábrica, sin logo)
    const abrirFormulario = () => {
        dispatch({ type: "ABRIR_MODAL" });
    };

    /**
     * Abre el modal en MODIFICACIÓN con la fila clickeada ya cargada: precarga
     * las 5 celdas y setea `metodo: "PUT"` + el `id_empresa` que viaja en el
     * body. El logo queda en `null` (= se conserva el actual).
     *
     * @param fila - Fila de la lista a editar.
     */
    const abrirModificacion = (fila: FilaEmpresa) => {
        dispatch({ type: "CARGAR_EMPRESA_EDICION", payload: fila });
    };

    // Cierra el modal y limpia form, error, carga, logo, metodo e id_empresa
    const cerrarFormulario = () => {
        dispatch({ type: "CERRAR_MODAL" });
    };

    /**
     * Guarda lo que se escribe en UNA celda del formulario.
     *
     * @param event - ChangeEvent del campo del formulario.
     */
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
     * Guarda el logo elegido. `null` cuando se elige ninguno o se deselecciona.
     *
     * @param event - ChangeEvent del input de archivo.
     */
    const cambiarLogo = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: "SET_LOGO", payload: event.target.files?.[0] ?? null });
    };

    /**
     * Deselecciona el logo nuevo y vuelve al que ya estaba.
     *
     * @param event - Click del botón "Quitar logo".
     */
    const quitarLogo = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        dispatch({ type: "SET_LOGO", payload: null });
    };

    /**
     * Alta de una empresa (POST /api/empresa_alta).
     *
     * 1. Valida SOLO campos vacíos (decisión de la spec 007: longitudes y
     *    formato los cubre Zod en el server) y corta sin pedir nada.
     * 2. Manda los 5 textos; las redes vacías no se mandan (el server las
     *    guarda en NULL) y el logo solo si se eligió uno.
     * 3. Si sale bien: cierra el modal y refresca el listado. Si no: el aviso
     *    queda en `error.formulario` y el modal sigue abierto.
     *
     * @param event - Click del botón "Guardar".
     */
    const postEmpresa = async (event: React.MouseEvent<HTMLButtonElement>) => {
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

            const resultado = await config.servicios.postEmpresa({
                razon_social: f.razon_social.value.trim(),
                domicilio: f.domicilio.value.trim(),
                // Vacío = no mandar el campo: el server lo guarda en NULL
                whatsapp: f.whatsapp.value.trim() || undefined,
                instagram: f.instagram.value.trim() || undefined,
                facebook: f.facebook.value.trim() || undefined,
                logo: state.logo,
            });

            if (resultado.code === "EMPRESA_ALTA_OK") {
                // ✅ creada: cierra y refresca desde la página 1
                dispatch({ type: "CERRAR_MODAL" });
                dispatch({ type: "ACTUALIZAR" });

            } else if (resultado.code === "FORMATO_LOGO_INVALIDO" ||
                       resultado.code === "TAMANO_LOGO_INVALIDO") {
                // 400 del logo: solo JPG/PNG/WEBP y hasta 2 MB. El server ya
                // manda el mensaje exacto
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "El logo no tiene un formato o tamaño válido." }});

            } else {
                // 400 de Zod, 403 si no es admin, 500, red caída…
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "No se pudo crear la empresa." }});
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
     * Modificación de una empresa (PUT /api/empresa_mod).
     *
     * 1. Valida SOLO los 2 campos obligatorios y corta sin pedir nada.
     * 2. Manda `id_empresa` + los 5 textos + el logo **solo si se eligió uno**
     *    (si no, el server conserva el actual).
     * 3. Si sale bien: cierra el modal y refresca. Si no: el aviso queda en
     *    `error.formulario` y el modal sigue abierto.
     *
     * @param event - Click del botón "Guardar cambios".
     */
    const putEmpresa = async (event: React.MouseEvent<HTMLButtonElement>) => {
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

            const resultado = await config.servicios.putEmpresa({
                id_empresa: state.id_empresa ?? 0,
                razon_social: f.razon_social.value.trim(),
                domicilio: f.domicilio.value.trim(),
                // Aquí sí van siempre, aunque estén vacías: mandarlas es lo que
                // permite BORRAR una red que el usuario ya no quiere mostrar.
                // Vacío = cadena vacía en la columna, no NULL (a diferencia del alta).
                whatsapp: f.whatsapp.value.trim(),
                instagram: f.instagram.value.trim(),
                facebook: f.facebook.value.trim(),
                logo: state.logo,
            });

            if (resultado.code === "EMPRESA_MOD_OK") {
                // ✅ modificación hecha: cierra y refresca
                dispatch({ type: "CERRAR_MODAL" });
                dispatch({ type: "ACTUALIZAR" });

            } else if (resultado.code === "EMPRESA_NO_ENCONTRADA" ||
                       resultado.code === "MODIFICAR_NOT_FOUND") {
                // 404: la empresa ya no existe
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "No existe una empresa con ese id." }});

            } else {
                // 400 de Zod, 400 del logo, 403, 500, red caída…
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "No se pudo modificar la empresa." }});
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
     * Reactiva una empresa dada de baja (PUT /api/empresa_mod con solo
     * `estado: "activos"`).
     *
     * El server borra la lógica está en la columna `estado`, así que reactivar
     * es un PUT normal. Solo se manda el estado: los demás campos no vienen, y
     * el `SET` dinámico del server no los toca.
     *
     * @param fila - Fila de la lista que está en "inactivos".
     */
    const reactivarEmpresa = async (fila: FilaEmpresa) => {
        try {
            dispatch({ type: "SET_ERROR", payload: { bloque: "listado", valor: null } });

            const resultado = await config.servicios.putEmpresa({
                id_empresa: fila.id_empresa,
                estado: "activos",
            });

            if (resultado.code === "EMPRESA_MOD_OK") {
                // ✅ reactivada: refresca desde la página 1
                dispatch({ type: "ACTUALIZAR" });

            } else {
                dispatch({ type: "SET_ERROR", payload: { bloque: "listado",
                    valor: resultado.message || "No se pudo reactivar la empresa." }});
            }

        } catch {
            // Red de seguridad: apiFetch nunca lanza, esto es por si falla algo nuestro
            dispatch({ type: "SET_ERROR", payload: { bloque: "listado",
                valor: "No se pudo procesar la operación, intente de nuevo." } });
        }
    };

    /* ======================================================================
       4. BAJA LÓGICA (DELETE /api/empresa_baja)
       ====================================================================== */

    /**
     * Abre la confirmación de baja con la fila cacheada (la leyenda del
     * `EliminarVentana` sale de ahí).
     *
     * @param fila - Fila de la lista a dar de baja.
     */
    const abrirEliminar = (fila: FilaEmpresa) => {
        dispatch({ type: "ABRIR_ELIMINAR", payload: fila });
    };

    // Cierra la confirmación sin borrar nada
    const cerrarEliminar = () => {
        dispatch({ type: "CERRAR_ELIMINAR" });
    };

    /**
     * Confirma la baja: la fila queda con `estado = "inactivos"` (NO se borra).
     *
     * Cierra el modal y refresca desde la página 1. El aviso va a
     * `error.eliminar`, que el `EliminarVentana` muestra adentro.
     *
     * @param fila - Fila que se está por dar de baja.
     */
    const deleteEmpresa = async (fila: FilaEmpresa) => {
        try {
            dispatch({ type: "SET_ERROR", payload: { bloque: "eliminar", valor: null } });
            dispatch({ type: "SET_CARGA", payload: { bloque: "eliminar", valor: true } });

            const resultado = await config.servicios.deleteEmpresa({
                id_empresa: fila.id_empresa,
            });

            if (resultado.code === "EMPRESA_BAJA_OK") {
                // ✅ dada de baja: cierra y refresca
                dispatch({ type: "CERRAR_ELIMINAR" });
                dispatch({ type: "ACTUALIZAR" });

            } else if (resultado.code === "EMPRESA_NO_ENCONTRADA" ||
                       resultado.code === "MODIFICAR_NOT_FOUND") {
                // 404: pasa si ya estaba dada de baja (el WHERE filtra por
                // estado "activos"), así que el resultado final es el mismo
                dispatch({ type: "CERRAR_ELIMINAR" });
                dispatch({ type: "ACTUALIZAR" });

            } else {
                // 403 si no es admin, 500, red caída…
                dispatch({ type: "SET_ERROR", payload: { bloque: "eliminar",
                    valor: resultado.message || "No se pudo dar de baja la empresa." }});
            }

        } catch {
            // Red de seguridad: apiFetch nunca lanza, esto es por si falla algo nuestro
            dispatch({ type: "SET_ERROR", payload: { bloque: "eliminar",
                valor: "No se pudo procesar la operación, intente de nuevo." } });

        } finally {
            dispatch({ type: "SET_CARGA", payload: { bloque: "eliminar", valor: false } });
        }
    };

    /* ======================================================================
       5. PANEL DE ANUNCIOS DE LA EMPRESA
       ====================================================================== */

    /**
     * Click en una fila: abre el panel con los anuncios de esa empresa. El
     * effect de arriba hace el request al cambiar el id.
     *
     * @param fila - Empresa clickeada.
     */
    const verAnuncios = (fila: FilaEmpresa) => {
        dispatch({ type: "ABRIR_PANEL_ANUNCIOS", payload: fila });
    };

    // Cierra el panel y vacía la lista
    const cerrarPanelAnuncios = () => {
        dispatch({ type: "CERRAR_PANEL_ANUNCIOS" });
    };

    return {
        state,

        // Listado
        cachearPagina,
        cambiarRazonSocial,
        cambiarEstado,
        limpiarFiltros,

        // Formulario: alta (POST), modificación (PUT) y reactivación
        abrirFormulario,
        abrirModificacion,
        cerrarFormulario,
        cachearFormulario,
        cambiarLogo,
        quitarLogo,
        postEmpresa,
        putEmpresa,
        reactivarEmpresa,

        // Baja lógica
        abrirEliminar,
        cerrarEliminar,
        deleteEmpresa,

        // Panel de anuncios de la empresa
        verAnuncios,
        cerrarPanelAnuncios,
    };
};