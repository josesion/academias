import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

export interface FiltrosListadoUsuarioAdminInputs {
    pagina: number;
    limit: number;
    id_escuela?: number;
};

export interface FilaUsuarioAdmin {
  id_usuario: number;
  usuario: string;
  nombre: string;
  apellido: string;
  celular: string | null;
  correo: string;
  rol: "alumno" | "usuario" | "administrador";
  estado: string;
  fecha_alta: string | Date;
  id_escuela: number;
}

/**
 * Listado paginado de cuentas con `rol = "alumno"`
 * (`GET /api/usuario_admin_lista_alumno`).
 *
 * Arma la query con `pagina`, `limit` e `id_escuela` (opcional: sin él el
 * server devuelve todas las escuelas). Corta con `401 NOT_AUTHENTICATED`
 * si la sesión no está activa, antes de pegarle al server.
 *
 * @param data - Filtros del listado (`pagina`, `limit` y `id_escuela` opcional).
 * @returns Promesa con las filas (`ApiResponse<FilaUsuarioAdmin[]>`).
 */
export const getCuentasAlumno = async( data : FiltrosListadoUsuarioAdminInputs ) 
:Promise<ApiResponse<FilaUsuarioAdmin[]>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401, 
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }    
    const params = new URLSearchParams();
    if (data.pagina) params.append("pagina", String(data.pagina));
    if (data.limit) params.append("limit", String(data.limit));
    if (data.id_escuela) params.append("id_escuela", String(data.id_escuela));

    const ruta = `${PAGINA}api/usuario_admin_lista_alumno?${params.toString()}`;

    return await apiFetch( ruta , {
        method : "GET",

    });
}


/**
 * Listado paginado de cuentas con `rol = "usuario"`
 * (`GET /api/usuario_admin_lista_usuario`).
 *
 * Gemelo de `getCuentasAlumno`: misma query (`pagina`, `limit` e
 * `id_escuela` opcional) y mismo corte de sesión.
 *
 * @param data - Filtros del listado (`pagina`, `limit` y `id_escuela` opcional).
 * @returns Promesa con las filas (`ApiResponse<FilaUsuarioAdmin[]>`).
 */
export const getCuentasUsuarios = async( data : FiltrosListadoUsuarioAdminInputs ) 
    :Promise<ApiResponse<FilaUsuarioAdmin[]>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401, 
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }    
    const params = new URLSearchParams();
    
    if (data.pagina) params.append("pagina", String(data.pagina));
    if (data.limit) params.append("limit", String(data.limit));
    if (data.id_escuela) params.append("id_escuela", String(data.id_escuela));

    const ruta  = `${PAGINA}api/usuario_admin_lista_usuario?${params.toString()}`;
    return await apiFetch( ruta , {
        method : "GET",

    });
}

export interface CrearUsuarioAdminInputs {
    usuario: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    celular?: string;
    correo: string;
    rol: 'alumno' | 'usuario';
    id_escuela: number;
};

export interface DataCrearResultUsuarioAdmin {
  usuario: string;
  correo: string;
}

/** Cuerpo del PUT (`EsquemaActualizarUsuarioAdmin` del server): `id_usuario`
 *  es el único obligatorio (es el que usa el `WHERE`); todo lo demás es
 *  opcional — lo que no llega no se modifica. `rol`, `estado`, `id_escuela`
 *  y `fecha_alta` **no viajan**: el server no los modifica. */
export interface ModificarUsuarioAdminInputs {
    id_usuario: number;
    usuario?: string;
    contrasena?: string;
    nombre?: string;
    apellido?: string;
    celular?: string;
    correo?: string;
};

export interface DataModificarResultUsuarioAdmin {
  id_usuario: number;
  usuario: string;
}

/**
 * Alta de una cuenta (`POST /api/usuario_admin_alta`).
 *
 * Manda los 8 campos del schema del server. **`id_escuela` sale del selector
 * del formulario** (decisión del usuario: el alta no siempre es en la escuela
 * de la sesión); `estado` y `fecha_alta` no viajan: los pone la BD.
 *
 * Corta con `401 NOT_AUTHENTICATED` si la sesión no está activa.
 * `apiFetch` nunca lanza: los errores llegan como `ApiResponse` con
 * `error: true` (409 `USUARIO_YA_REGISTRADO`, 400 de Zod, 403 si no es
 * administrador, 500, red caída con `statusCode: 0`).
 *
 * @param data - Datos del formulario (contraseña en claro: la hashea el server).
 * @returns Promesa con `ApiResponse<DataCrearResultUsuarioAdmin>`
 *          (`data` trae `usuario` y `correo`).
 */
export const postUsuarios = async( data : CrearUsuarioAdminInputs  ) 
    :Promise<ApiResponse<DataCrearResultUsuarioAdmin>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401, 
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }    
    

    const ruta  = `${PAGINA}api/usuario_admin_alta`;
    return await apiFetch( ruta , {
        method : "POST",
        body : data
    });
}

/**
 * Modificación de una cuenta (`PUT /api/usuario_admin_mod`).
 *
 * Manda `id_usuario` (obligatorio: sale de la fila cacheada) junto con los
 * campos editables. **La contraseña vacía no se manda**: el server solo la
 * hashea si llega, así que omitirla mantiene la actual. `rol` y `id_escuela`
 * no viajan: el server no los modifica (decisión de negocio).
 *
 * Corta con `401 NOT_AUTHENTICATED` si la sesión no está activa.
 * `apiFetch` nunca lanza: los errores llegan como `ApiResponse` con
 * `error: true` (`USUARIO_NO_ENCONTRADO` 404, `USUARIO_YA_REGISTRADO` y
 * `USUARIO_YA_CORREO` 409, 400 de Zod, 403 si no es administrador, 500,
 * red caída con `statusCode: 0`).
 *
 * @param data - Datos a modificar (contraseña en claro: la hashea el server).
 * @returns Promesa con `ApiResponse<DataModificarResultUsuarioAdmin>`
 *          (`data` trae `id_usuario` y el `usuario` vigente).
 */
export const putUsuarios = async( data : ModificarUsuarioAdminInputs )
    :Promise<ApiResponse<DataModificarResultUsuarioAdmin>> =>{

    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }

    const ruta  = `${PAGINA}api/usuario_admin_mod`;
    return await apiFetch( ruta , {
        method : "PUT",
        body : data
    });
}