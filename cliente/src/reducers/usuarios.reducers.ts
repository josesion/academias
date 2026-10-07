/* ==========================================================================
   ESTRUCTURA DEL ARCHIVO
   Todo está agrupado por especificidad, con el mismo orden en el tipado,
   el estado inicial, las acciones y el reducer:

   1. LISTADO USUARIOS -> cuentas de rol "usuario" (GET /api/usuario_admin_lista_usuario)
   2. LISTADO ALUMNOS  -> cuentas de rol "alumno"  (GET /api/usuario_admin_lista_alumno)
   3. FILTROS          -> escuela y paginación de CADA listado
   4. OPCIONES         -> escuelas del selector del filtro (GET /api/esc_plan_list)
   5. FORMULARIO       -> alta (POST /api/usuario_admin_alta) y modificación
                          (PUT /api/usuario_admin_mod)

   Nota: los 2 listados son independientes: cada uno trae su filtro, su
   paginación, su carga, su error y su contador de refresco. Las claves
   `carga` / `error` se indexan con `BloqueCarga` (los 2 listados + `opciones`
   + `formulario`) y `actualizar` con `BloqueListado`.
   ========================================================================== */

/* ==========================================================================
   TIPOS AUXILIARES
   ========================================================================== */

import type {
    FilaUsuarioAdmin,
    FiltrosListadoUsuarioAdminInputs,
} from "../servicio/usuarios.admin.fetch";
// Celdas del formulario: mismo tipo que el de suscripciones (decisión de
// proyecto: los tipos del form viven en `reducers/suspcripciones.ts`)
import type { CeldasInput } from "./suspcripciones";
// Opciones del selector de escuela: mismos tipos que el formulario de
// suscripciones (decisión de proyecto: salen de suspcripciones.fetch)
import type { EscPlanDTO } from "../servicio/suspcripciones.fetch";

/** Identifica el listado que toca la acción: `usuarios` o `alumnos`.
 *  Todas las acciones de listado/filtro llevan este bloque en el payload. */
export type BloqueListado = "usuarios" | "alumnos";

/** Como `BloqueListado` más el bloque `opciones` (el selector de escuela) y
 *  `formulario` (el alta): solo sirve para `SET_CARGA` / `SET_ERROR`, que
 *  comparten las 4 claves. */
export type BloqueCarga = BloqueListado | "opciones" | "formulario";

/** UI del paginador: `pagina` es la que se muestra, `contadorPagina` es el
 *  total de páginas que manda el server (ApiResponse.paginacion). */
export interface Paginacion {
    pagina: number;
    limite: number;
    contadorPagina: number;
}

/* ==========================================================================
   ESTADO
   ========================================================================== */

export interface UsuariosTipado {

    /* ---------- 1. LISTADO USUARIOS ---------- */
    filtrosUsuarios: FiltrosListadoUsuarioAdminInputs;
    listadoUsuarios: FilaUsuarioAdmin[];
    paginacionUsuarios: Paginacion;

    /* ---------- 2. LISTADO ALUMNOS ---------- */
    filtrosAlumnos: FiltrosListadoUsuarioAdminInputs;
    listadoAlumnos: FilaUsuarioAdmin[];
    paginacionAlumnos: Paginacion;

    /* ---------- CLAVES POR LISTADO ---------- */
    // ¿Cargando? Una clave por bloque (los 2 listados + el selector de escuela
    // + el formulario): SET_CARGA { bloque, valor }
    carga: {
        usuarios: boolean;
        alumnos: boolean;
        opciones: boolean;
        formulario: boolean;
    },
    // Aviso de cada bloque (null = sin error)
    error: {
        usuarios: string | null;
        alumnos: string | null;
        opciones: string | null,
        formulario: string | null,
    },
    // Contador de refresco por listado: cuando sube, el effect vuelve a pedir
    // las filas de ese listado sin tocar el otro ni los filtros.
    actualizar: {
        usuarios: number;
        alumnos: number;
    },

    /* ---------- 4. OPCIONES ---------- */
    // Escuelas del <SelectorOpt> (GET /api/esc_plan_list). Null hasta que el
    // servidor responde; solo se usan las `escuelas` de EscPlanDTO.
    opciones: EscPlanDTO | null,

    /* ---------- 5. FORMULARIO (alta / modificación de cuentas) ---------- */
    // ¿En qué modo está abierto el form? POST = alta, PUT = modificación.
    // Lo fija ABRIR_MODAL / CARGAR_USUARIO_EDICION y lo limpia CERRAR_MODAL.
    metodo: "POST" | "PUT" | null,
    // Cuenta a modificar: id que sale de la fila del listado y viaja solo
    // en el PUT. No se pinta en ningún lado.
    id_usuario: number | null,
    // ¿El modal del alta está abierto? Lo manejan ABRIR_MODAL / CERRAR_MODAL
    modal: {
        formulario: boolean;
    },
    // Celdas del form: `id_escuela` es un select (obligatorio, del selector),
    // `rol` arranca en "usuario" y `celular` es el único campo opcional
    formulario: {
        id_escuela: CeldasInput;
        usuario: CeldasInput;
        contrasena: CeldasInput;
        nombre: CeldasInput;
        apellido: CeldasInput;
        celular: CeldasInput;
        correo: CeldasInput;
        rol: CeldasInput;
    },
}

/* ==========================================================================
   ESTADO INICIAL
   ========================================================================== */

export const initialUsuarios = (): UsuariosTipado => ({

    /* ---------- 1. LISTADO USUARIOS ---------- */
    filtrosUsuarios: {
        pagina: 1,
        limit: 6,
        // id_escuela sin definir = todas las escuelas
    },
    listadoUsuarios: [],
    paginacionUsuarios: {
        pagina: 1,
        limite: 6,
        contadorPagina: 1,
    },

    /* ---------- 2. LISTADO ALUMNOS ---------- */
    filtrosAlumnos: {
        pagina: 1,
        limit: 6,
    },
    listadoAlumnos: [],
    paginacionAlumnos: {
        pagina: 1,
        limite: 6,
        contadorPagina: 1,
    },

    /* ---------- CLAVES POR LISTADO ---------- */
    carga: {
        usuarios: false,
        alumnos: false,
        opciones: false,
        formulario: false,
    },
    error: {
        usuarios: null,
        alumnos: null,
        opciones: null,
        formulario: null,
    },
    actualizar: {
        usuarios: 0,
        alumnos: 0,
    },

    /* ---------- 4. OPCIONES ---------- */
    opciones: null,

    /* ---------- 5. FORMULARIO ---------- */
    metodo: "POST",
    id_usuario: null,
    modal: {
        formulario: false,
    },
    formulario: {
        // Vacío a propósito: obligatorio (el label lo aporta el SelectorOpt)
        id_escuela: { name: "id_escuela", value: "" },
        usuario: { name: "usuario", value: "" },
        contrasena: { name: "contrasena", value: "" },
        nombre: { name: "nombre", value: "" },
        apellido: { name: "apellido", value: "" },
        celular: { name: "celular", value: "" },
        correo: { name: "correo", value: "" },
        // Arranca en "usuario" (decisión del usuario, spec 007)
        rol: { name: "rol", value: "usuario" },
    },
});

/* ==========================================================================
   TIPOS AUXILIARES DE LAS ACCIONES
   ========================================================================== */

// Campos del filtro: SET_CAMPO_FILTRO solo puede pisar una de estas celdas
// (pagina / limit viajan en el request; id_escuela es opcional)
export type CampoFiltroKey = keyof FiltrosListadoUsuarioAdminInputs;

// Campos del formulario: SET_CAMPO_FORM solo puede pisar una de estas celdas
export type CampoFormularioKey = keyof UsuariosTipado["formulario"];

/* ==========================================================================
   ACCIONES
   ========================================================================== */

export type UsuariosAction =

    /* ---------- 1. Y 2. LISTADOS ---------- */
    // Filas del listado que indica `bloque`
    | { type: "SET_LISTADO"; payload: { bloque: BloqueListado; filas: FilaUsuarioAdmin[] } }
    // carga / error llevan el bloque: { campo } de suscripciones pasa a
    // { bloque }, y aceptan también "opciones" y "formulario"
    | { type: "SET_CARGA"; payload: { bloque: BloqueCarga; valor: boolean } }
    | { type: "SET_ERROR"; payload: { bloque: BloqueCarga; valor: string | null } }
    // Páginas del paginador: llega la respuesta del server
    // ({ pagina, limite, contadorPagina }) o un parcial
    | { type: "SET_PAGINACION"; payload: { bloque: BloqueListado; valor: Partial<Paginacion> } }
    // Refresca UN listado desde la página 1 (mismo criterio que la spec 005)
    | { type: "ACTUALIZAR"; payload: BloqueListado }

    /* ---------- 3. FILTROS ---------- */
    | { type: "SET_CAMPO_FILTRO"; payload: { bloque: BloqueListado; campo: CampoFiltroKey; valor: number | undefined } }
    | { type: "RESET_FILTROS"; payload: BloqueListado }

    /* ---------- 4. OPCIONES ---------- */
    // Escuelas del selector: llegan juntas en un objeto ({ escuelas,
    // planes_saas }); null = todavía no se pidieron o algo falló
    | { type: "SET_OPCIONES"; payload: EscPlanDTO | null }

    /* ---------- 5. FORMULARIO (alta y modificación de cuentas) ---------- */
    // Abre el modal en ALTA: form de fábrica (rol vuelve a "usuario")
    | { type: "ABRIR_MODAL" }
    // Abre el modal en MODIFICACIÓN con la fila clickeada ya cargada
    // (metodo "PUT", id_usuario y las 8 celdas precargadas)
    | { type: "CARGAR_USUARIO_EDICION"; payload: FilaUsuarioAdmin }
    // Cierra el modal y limpia form, error, carga, metodo e id_usuario
    | { type: "CERRAR_MODAL" }
    // Limpia form, error y carga SIN cerrar el modal (toca datos, no vista)
    | { type: "RESET_FORM" }
    // Escribe lo que se tipea / se elige en UNA celda del form
    | { type: "SET_CAMPO_FORM"; payload: { campo: CampoFormularioKey; valor: string } };

/* ==========================================================================
   REDUCER
   ========================================================================== */

/**
 * Reducer de la pantalla de Cuentas: maneja los 2 listados apilados
 * (Usuarios y Alumnos) con sus filtros, paginación, carga y error.
 *
 * @param state - Estado vigente (`initialUsuarios()` al arrancar).
 * @param action - Acción a aplicar; siempre devuelve un estado nuevo.
 * @returns Estado nuevo con el cambio aplicado.
 */
export const UsuariosReducers = (
    state: UsuariosTipado,
    action: UsuariosAction
): UsuariosTipado => {

    switch (action.type) {

        /* ==================================================================
           1. Y 2. LISTADOS
           ================================================================== */

        // Filas del listado que indica `bloque`. Al llegar datos nuevos se
        // limpia SU aviso: `useEffectServicio` nunca despacha `accionError(null)`,
        // sin esto el error anterior se quedaría pegado en la pantalla.
        case "SET_LISTADO":
            return action.payload.bloque === "usuarios"
                ? {
                    ...state,
                    listadoUsuarios: action.payload.filas,
                    error: { ...state.error, usuarios: null },
                }
                : {
                    ...state,
                    listadoAlumnos: action.payload.filas,
                    error: { ...state.error, alumnos: null },
                };

        case "SET_CARGA":
            return {
                ...state,
                carga: {
                    ...state.carga,
                    [action.payload.bloque]: action.payload.valor,
                },
            };

        case "SET_ERROR":
            return {
                ...state,
                error: {
                    ...state.error,
                    [action.payload.bloque]: action.payload.valor,
                },
            };

        // Recibe la paginación de ApiResponse o un parcial: solo lo que viene
        // en el payload pisa el valor actual de ESE listado.
        case "SET_PAGINACION":
            return action.payload.bloque === "usuarios"
                ? {
                    ...state,
                    paginacionUsuarios: {
                        ...state.paginacionUsuarios,
                        ...action.payload.valor,
                    },
                }
                : {
                    ...state,
                    paginacionAlumnos: {
                        ...state.paginacionAlumnos,
                        ...action.payload.valor,
                    },
                };

        // Refresco del listado DESDE LA PÁGINA 1: sube su contador y
        // resetea la página en sus dos hogares — la de los filtros (el effect
        // pide ?pagina=1) y la del paginador. No toca el otro listado.
        case "ACTUALIZAR": {
            if (action.payload === "usuarios") {
                return {
                    ...state,
                    actualizar: {
                        ...state.actualizar,
                        usuarios: state.actualizar.usuarios + 1,
                    },
                    filtrosUsuarios: {
                        ...state.filtrosUsuarios,
                        pagina: 1,
                    },
                    paginacionUsuarios: {
                        ...state.paginacionUsuarios,
                        pagina: 1,
                    },
                };
            }
            return {
                ...state,
                actualizar: {
                    ...state.actualizar,
                    alumnos: state.actualizar.alumnos + 1,
                },
                filtrosAlumnos: {
                    ...state.filtrosAlumnos,
                    pagina: 1,
                },
                paginacionAlumnos: {
                    ...state.paginacionAlumnos,
                    pagina: 1,
                },
            };
        }

        /* ==================================================================
           3. FILTROS
           ================================================================== */

        case "SET_CAMPO_FILTRO": {
            const { bloque, campo, valor } = action.payload;

            if (bloque === "usuarios") {
                return {
                    ...state,
                    filtrosUsuarios: {
                        ...state.filtrosUsuarios,
                        [campo]: valor,
                    },
                };
            }
            return {
                ...state,
                filtrosAlumnos: {
                    ...state.filtrosAlumnos,
                    [campo]: valor,
                },
            };
        }

        // Vuelve a la configuración de fábrica de UN listado. Resetear solo
        // `filtros.pagina` dejaría el paginador apuntando a otra página:
        // la página vive en los dos lados, así que se resetean juntas.
        case "RESET_FILTROS":
            return action.payload === "usuarios"
                ? {
                    ...state,
                    filtrosUsuarios: initialUsuarios().filtrosUsuarios,
                    paginacionUsuarios: initialUsuarios().paginacionUsuarios,
                }
                : {
                    ...state,
                    filtrosAlumnos: initialUsuarios().filtrosAlumnos,
                    paginacionAlumnos: initialUsuarios().paginacionAlumnos,
                };

        /* ==================================================================
           4. OPCIONES
           ================================================================== */

        // Escuelas del selector: llegan juntas ({ escuelas, planes_saas });
        // null limpia si algo falló. Como en SET_LISTADO, un valor nuevo
        // borra SU aviso (el util no manda `accionError(null)`).
        case "SET_OPCIONES":
            return {
                ...state,
                opciones: action.payload,
                error: { ...state.error, opciones: null },
            };

        /* ==================================================================
           5. FORMULARIO (alta de cuentas)
           ================================================================== */

        // Abre el modal en ALTA: form de fábrica (rol "usuario"), sin el
        // aviso de una intentona anterior y con el método puesto en POST
        case "ABRIR_MODAL":
            return {
                ...state,
                metodo: "POST",
                id_usuario: null,
                modal: {
                    ...state.modal,
                    formulario: true,
                },
                error: {
                    ...state.error,
                    formulario: null,
                },
                formulario: initialUsuarios().formulario,
            };

        // Abre el modal en MODIFICACIÓN con la fila clickeada ya cargada:
        // metodo "PUT" (para que el botón llame a putUsuario), id que viaja
        // en el body y las 8 celdas precargadas. La contraseña NUNCA se
        // precarga (vacío = no se manda = se mantiene la actual).
        case "CARGAR_USUARIO_EDICION": {
            const fila = action.payload;
            return {
                ...state,
                metodo: "PUT",
                id_usuario: fila.id_usuario,
                modal: {
                    ...state.modal,
                    formulario: true,
                },
                error: {
                    ...state.error,
                    formulario: null,
                },
                // Si quedó cargando de una intentona anterior, se apaga
                carga: {
                    ...state.carga,
                    formulario: false,
                },
                formulario: {
                    id_escuela: { name: "id_escuela", value: String(fila.id_escuela) },
                    usuario:    { name: "usuario",    value: fila.usuario },
                    contrasena: { name: "contrasena", value: "" },
                    nombre:     { name: "nombre",     value: fila.nombre },
                    apellido:   { name: "apellido",   value: fila.apellido },
                    celular:    { name: "celular",    value: fila.celular ?? "" },
                    correo:     { name: "correo",     value: fila.correo },
                    rol:        { name: "rol",        value: fila.rol },
                },
            };
        }

        // Cierra y limpia TODO lo del form (listado, filtros y paginación
        // quedan como estaban): celdas, aviso, carga, el método de trabajo
        // y el id de la cuenta que se estaba editando.
        case "CERRAR_MODAL":
            return {
                ...state,
                metodo: "POST",
                id_usuario: null,
                modal: {
                    ...state.modal,
                    formulario: false,
                },
                error: {
                    ...state.error,
                    formulario: null,
                },
                carga: {
                    ...state.carga,
                    formulario: false,
                },
                formulario: initialUsuarios().formulario,
            };

        // Resetea los datos del form (celdas de fábrica + su aviso y su
        // carga) dejando el modal COMO ESTABA: RESET_FORM toca datos, no
        // vista. Mismo criterio que RESET_FORM de `suspcripciones.ts`.
        case "RESET_FORM":
            return {
                ...state,
                error: {
                    ...state.error,
                    formulario: null,
                },
                carga: {
                    ...state.carga,
                    formulario: false,
                },
                formulario: initialUsuarios().formulario,
            };

        // Pisa el `value` de UNA celda del form (input o select)
        case "SET_CAMPO_FORM":
            return {
                ...state,
                formulario: {
                    ...state.formulario,
                    [action.payload.campo]: {
                        ...state.formulario[action.payload.campo],
                        value: action.payload.valor,
                    },
                },
            };

        default:
            return state;
    }
};
