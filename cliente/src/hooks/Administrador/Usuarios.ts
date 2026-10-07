import { useReducer } from "react";
import {
    UsuariosReducers,
    initialUsuarios,
    type UsuariosAction,
    type BloqueListado,
    type CampoFormularioKey,
} from "../../reducers/usuarios.reducers";
import { useEffectServicio } from "../../utils/useEfectServicio";
import type {
    FilaUsuarioAdmin,
    FiltrosListadoUsuarioAdminInputs,
} from "../../servicio/usuarios.admin.fetch";
// Opciones del selector de escuela (mismos tipos que suscripciones)
import type { EscPlanDTO } from "../../servicio/suspcripciones.fetch";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface PropsUsuario {
    servicios: {
        getCuentasAlumno: ServicioCrud,
        getCuentasUsuarios: ServicioCrud,
        getEscPlanes: ServicioCrud,
        postUsuarios: ServicioCrud,
        putUsuarios: ServicioCrud,
    },
};

/** Los 2 listados que se recorren al cambiar el filtro de escuela */
const LISTADOS: BloqueListado[] = ["usuarios", "alumnos"];

/** Campos obligatorios del alta: `celular` es el único opcional. La etiqueta
 *  solo se usa para armar el aviso "Completá …" (el rol arranca en "usuario"
 *  y la academia en "" — esta última también entra en la lista). */
const CAMPOS_OBLIGATORIOS: { campo: CampoFormularioKey; etiqueta: string }[] = [
    { campo: "id_escuela", etiqueta: "la academia" },
    { campo: "usuario", etiqueta: "el usuario" },
    { campo: "contrasena", etiqueta: "la contraseña" },
    { campo: "nombre", etiqueta: "el nombre" },
    { campo: "apellido", etiqueta: "el apellido" },
    { campo: "correo", etiqueta: "el correo" },
];

/** Campos obligatorios al MODIFICAR (PUT): la contraseña es opcional (vacío
 *  = no se manda = se mantiene la actual) y academia / rol / id no se
 *  editan — salen de la fila y el server los ignora. */
const CAMPOS_OBLIGATORIOS_EDICION: { campo: CampoFormularioKey; etiqueta: string }[] = [
    { campo: "usuario", etiqueta: "el usuario" },
    { campo: "nombre", etiqueta: "el nombre" },
    { campo: "apellido", etiqueta: "el apellido" },
    { campo: "correo", etiqueta: "el correo" },
];

/**
 * Lógica de la pantalla de Cuentas: los 2 listados apilados (Usuarios y
 * Alumnos), las opciones del selector de escuela y el alta de cuentas.
 *
 * Cada listado tiene SU effect (mismo `useEffectServicio` de suscripciones):
 * sus filtros, su paginación y su contador de refresco viven separados, así
 * que paginar uno no mueve al otro.
 *
 * @param config - Servicios inyectados desde `hookNegocios/abmUsuarios.ts`.
 * @returns `state` del reducer + handlers (`cachearPagina`, `cambiarEscuela`
 *          y los del formulario: alta y modificación de cuentas).
 */
export const useLogicaUsuarios = (config: PropsUsuario) => {

    const [state, dispatch] = useReducer(UsuariosReducers, initialUsuarios());

    /* ======================================================================
       1. LISTADO DE USUARIOS (GET /api/usuario_admin_lista_usuario)

       `filtrosUsuarios` entra en dependencias: cada objeto nuevo (página,
       escuela) dispara un request nuevo. `actualizar.usuarios` sube cuando
       hay que refrescar desde la página 1.
       ====================================================================== */

    useEffectServicio<FiltrosListadoUsuarioAdminInputs, FilaUsuarioAdmin[], UsuariosAction>({
        dispatch,
        servicios: config.servicios.getCuentasUsuarios,
        valores: state.filtrosUsuarios,
        // `accionResultado` recibe `R | null`: un error deja el listado vacío
        accionResultado: (filas) => ({ type: "SET_LISTADO", payload: { bloque: "usuarios", filas: filas ?? [] } }),
        accionCarga:     (carga) => ({ type: "SET_CARGA", payload: { bloque: "usuarios", valor: carga } }),
        accionError:     (msg)   => ({ type: "SET_ERROR", payload: { bloque: "usuarios", valor: msg } }),
        accionPaginacion:(p)     => ({ type: "SET_PAGINACION", payload: { bloque: "usuarios", valor: p } }),
        useAbort: true,
        dependencias: [state.filtrosUsuarios, state.actualizar.usuarios],
    });

    /* ======================================================================
       2. LISTADO DE ALUMNOS (GET /api/usuario_admin_lista_alumno)

       Gemelo del anterior con filtros, carga, error y paginación propios.
       ====================================================================== */

    useEffectServicio<FiltrosListadoUsuarioAdminInputs, FilaUsuarioAdmin[], UsuariosAction>({
        dispatch,
        servicios: config.servicios.getCuentasAlumno,
        valores: state.filtrosAlumnos,
        accionResultado: (filas) => ({ type: "SET_LISTADO", payload: { bloque: "alumnos", filas: filas ?? [] } }),
        accionCarga:     (carga) => ({ type: "SET_CARGA", payload: { bloque: "alumnos", valor: carga } }),
        accionError:     (msg)   => ({ type: "SET_ERROR", payload: { bloque: "alumnos", valor: msg } }),
        accionPaginacion:(p)     => ({ type: "SET_PAGINACION", payload: { bloque: "alumnos", valor: p } }),
        useAbort: true,
        dependencias: [state.filtrosAlumnos, state.actualizar.alumnos],
    });

    /* ======================================================================
       3. OPCIONES DEL SELECTOR DE ESCUELA (GET /api/esc_plan_list)

       Se piden UNA sola vez al montar (`dependencias: []`): no dependen de
       ningún filtro. De `EscPlanDTO` solo se pintan las `escuelas`.
       ====================================================================== */

    useEffectServicio<undefined, EscPlanDTO, UsuariosAction>({
        dispatch,
        servicios: config.servicios.getEscPlanes,
        // getEscPlanes no recibe parámetros: no hay valores que mandarle
        accionResultado: (opciones) => ({ type: "SET_OPCIONES", payload: opciones }),
        accionCarga:     (carga)    => ({ type: "SET_CARGA", payload: { bloque: "opciones", valor: carga } }),
        accionError:     (msg)      => ({ type: "SET_ERROR", payload: { bloque: "opciones", valor: msg } }),
        // Sin accionPaginacion: la respuesta de esc_plan_list no trae paginación
        useAbort: true,
        dependencias: [],
    });

    /**
     * Cambia de página de UN listado: el número vive en dos lados y hay que
     * mover los dos en el mismo evento (React 18 agrupa → un solo request).
     *
     * 1. `SET_CAMPO_FILTRO pagina` — la que viaja al server (?pagina=N):
     *    al crearse un objeto de filtros nuevo, el effect se dispara.
     * 2. `SET_PAGINACION` — la que pinta el paginador.
     *
     * @param bloque - `"usuarios"` o `"alumnos"`.
     * @param pagina - Página a pedir.
     */
    const cachearPagina = (bloque: BloqueListado, pagina: number) => {
        dispatch({ type: "SET_CAMPO_FILTRO", payload: { bloque, campo: "pagina", valor: pagina } });
        dispatch({ type: "SET_PAGINACION", payload: { bloque, valor: { pagina } } });
    };

    /**
     * Cambia la escuela del filtro de LOS 2 listados y los refresca.
     *
     * Por cada listado despacha `SET_CAMPO_FILTRO id_escuela` + `ACTUALIZAR`
     * (4 despachadas batched → 2 requests, uno por listado). `ACTUALIZAR`
     * además resetea la página a 1 en los dos lados (spec 005).
     *
     * "Todas las escuelas" se manda como `id_escuela` **sin definir**: el
     * server lo trata como opcional y no filtra.
     *
     * @param event - ChangeEvent del `<select>` de escuela.
     */
    const cambiarEscuela = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const id_escuela = event.target.value ? Number(event.target.value) : undefined;

        LISTADOS.forEach((bloque) => {
            dispatch({ type: "SET_CAMPO_FILTRO", payload: { bloque, campo: "id_escuela", valor: id_escuela } });
            dispatch({ type: "ACTUALIZAR", payload: bloque });
        });
    };

    /* ======================================================================
       4. FORMULARIO (POST /api/usuario_admin_alta · PUT /api/usuario_admin_mod)

       Las opciones de sus dos selects YA están cargadas (`state.opciones`,
       pedidas para el filtro): ni el alta ni la modificación piden nada más.
       ====================================================================== */

    // Abre el modal en blanco (el form de fábrica tiene rol "usuario")
    const abrirFormulario = () => {
        dispatch({ type: "ABRIR_MODAL" });
    };

    /**
     * Abre el modal en MODIFICACIÓN con la fila clickeada ya cargada:
     * precarga las 8 celdas y setea `metodo: "PUT"` + el `id_usuario` que
     * viaja en el body. Academia y rol quedan solo lectura (el server no
     * los modifica) y la contraseña arranca vacía.
     *
     * @param fila - Fila de la lista (Usuarios o Alumnos) a editar.
     */
    const abrirModificacion = (fila: FilaUsuarioAdmin) => {
        dispatch({ type: "CARGAR_USUARIO_EDICION", payload: fila });
    };

    // Cierra el modal y limpia form, error, carga, metodo e id_usuario
    // (los listados no se tocan)
    const cerrarFormulario = () => {
        dispatch({ type: "CERRAR_MODAL" });
    };

    /**
     * Guarda lo que se escribe / se elige en UNA celda del formulario.
     * La misma función sirve para `<Inputs>` (ChangeEvent de input) y para
     * los `<SelectorOpt>` (ChangeEvent de select).
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
     * Alta de una cuenta (POST /api/usuario_admin_alta).
     *
     * 1. Valida SOLO campos vacíos (decisión de la spec 007: longitudes y
     *    formato de email los cubre Zod en el server) y corta sin pedir nada.
     * 2. Manda los 8 campos: `id_escuela` sale del selector del form y
     *    `celular` vacío se manda `undefined` (opcional en Zod).
     * 3. Si sale bien: cierra el modal (limpia el form) y refresca los 2
     *    listados. Si no: el aviso queda en `error.formulario` y el modal
     *    sigue abierto.
     *
     * @param event - Click del botón "Guardar".
     */
    const postUsuario = async (event: React.MouseEvent<HTMLButtonElement>) => {
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

            const resultado = await config.servicios.postUsuarios({
                usuario: f.usuario.value.trim(),
                contrasena: f.contrasena.value,
                nombre: f.nombre.value.trim(),
                apellido: f.apellido.value.trim(),
                // Vacío = no mandar el campo (opcional en el schema)
                celular: f.celular.value.trim() || undefined,
                correo: f.correo.value.trim(),
                // El select solo ofrece estas 2 opciones
                rol: f.rol.value === "alumno" ? "alumno" : "usuario",
                id_escuela: Number(f.id_escuela.value),
            });

            if (resultado.code === "CREAR_USUARIO_ADMIN_OK") {
                // ✅ alta creada: cierra y refresca los 2 listados (2 requests)
                dispatch({ type: "CERRAR_MODAL" });
                dispatch({ type: "ACTUALIZAR", payload: "usuarios" });
                dispatch({ type: "ACTUALIZAR", payload: "alumnos" });

            } else if (resultado.code === "USUARIO_YA_REGISTRADO") {
                // 409: el server ya manda el mensaje exacto
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "Ese nombre de usuario ya está en uso." }});

            } else {
                // 400 de Zod, 403 si no es admin, 500, red caída…
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "No se pudo crear la cuenta." }});
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
     * Modificación de una cuenta (PUT /api/usuario_admin_mod).
     *
     * 1. Valida SOLO campos vacíos de los 4 editables obligatorios (la
     *    contraseña es opcional: vacío = no se manda = se mantiene la
     *    actual; academia, rol e id salen de la fila) y corta sin pedir nada.
     * 2. Manda `id_usuario` (el de la fila cacheada) + lo editado.
     * 3. Si sale bien: cierra el modal (limpia form, metodo e id) y
     *    refresca los 2 listados. Si no: el aviso queda en
     *    `error.formulario` y el modal sigue abierto.
     *
     * @param event - Click del botón "Guardar cambios".
     */
    const putUsuario = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        const f = state.formulario;
        const faltantes = CAMPOS_OBLIGATORIOS_EDICION.filter((c) => !f[c.campo].value.trim());

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

            const resultado = await config.servicios.putUsuarios({
                id_usuario: state.id_usuario ?? 0,
                usuario: f.usuario.value.trim(),
                // Vacío = no mandar el campo: el server mantiene la actual
                contrasena: f.contrasena.value || undefined,
                nombre: f.nombre.value.trim(),
                apellido: f.apellido.value.trim(),
                celular: f.celular.value.trim() || undefined,
                correo: f.correo.value.trim(),
            });

            if (resultado.code === "ACTUALIZAR_USUARIO_ADMIN_OK") {
                // ✅ modificación hecha: cierra y refresca los 2 listados (2 requests)
                dispatch({ type: "CERRAR_MODAL" });
                dispatch({ type: "ACTUALIZAR", payload: "usuarios" });
                dispatch({ type: "ACTUALIZAR", payload: "alumnos" });

            } else if (resultado.code === "USUARIO_YA_REGISTRADO") {
                // 409: el login lo usa OTRO usuario
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "Ese nombre de usuario ya está en uso." }});

            } else if (resultado.code === "USUARIO_YA_CORREO") {
                // 409: solo aplica a alumnos (el correo es también el login)
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "Ese correo ya está en uso por otro usuario." }});

            } else if (resultado.code === "USUARIO_NO_ENCONTRADO") {
                // 404: la cuenta ya no existe
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "No existe un usuario con ese id." }});

            } else {
                // 400 de Zod, 403 si no es admin, 500, red caída…
                dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                    valor: resultado.message || "No se pudo modificar la cuenta." }});
            }

        } catch {
            // Red de seguridad: apiFetch nunca lanza, esto es por si falla algo nuestro
            dispatch({ type: "SET_ERROR", payload: { bloque: "formulario",
                valor: "No se pudo procesar la operación, intente de nuevo." } });

        } finally {
            dispatch({ type: "SET_CARGA", payload: { bloque: "formulario", valor: false } });
        }
    };

    return {
        state,

        // Listados
        cachearPagina,
        cambiarEscuela,

        // Formulario: alta (POST) y modificación (PUT)
        abrirFormulario,
        abrirModificacion,
        cerrarFormulario,
        cachearFormulario,
        postUsuario,
        putUsuario,
    };
};
