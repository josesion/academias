import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

/**
 * Una fila de `empresas` tal como la devuelve el listado.
 *
 * `whatsapp`, `instagram`, `facebook` y `logo_url` pueden venir en `null`: las
 * tres redes y el logo son opcionales en el alta y la columna acepta NULL.
 * `estado` viene en plural porque es lo que escribe la columna: `"activos"` o
 * `"inactivos"`.
 */
export interface FilaEmpresa {
    id_empresa: number;
    razon_social: string;
    domicilio: string;
    whatsapp: string | null;
    instagram: string | null;
    facebook: string | null;
    logo_url: string | null;
    public_id: string | null;
    /** "activos" | "inactivos" */
    estado: string;
    fecha_creacion: string | Date;
}

/**
 * Filtros del listado de empresas (van por query string).
 *
 * `estado` NO se manda si no hay filtro: sin él el server trae solo las activas,
 * y mandarlo vacío haría que el `enum` lo rechace con 400.
 */
export interface FiltrosEmpresasQuery {
    pagina: number;
    limit: number;
    /** Parcial: se busca con `LIKE %…%` sobre `razon_social`. */
    razon_social?: string;
    /** "activos" | "inactivos" */
    estado?: string;
}

/**
 * Listado paginado de empresas (GET /api/empresa_lista).
 *
 * - `EMPRESA_LISTA_OK` (200): filas + `paginacion`.
 * - `SIN_EMPRESAS` (**204**): no hay empresas para ese filtro. El server lo
 *   manda sin cuerpo, así que `apiFetch` lo normaliza a
 *   `{ error: false, data: null }`: es **lista vacía, no error** (mismo camino
 *   que la bitácora de la spec 009).
 * - `NOT_AUTHENTICATED` (401) / `ERROR_SERVIDOR` (500).
 *
 * `limit` no puede pasar de 100 en el server: es el tope de Zod.
 *
 * @param data - Paginación y filtros opcionales.
 * @returns Respuesta estandarizada (`error`, `message`, `code`, `data`, `paginacion`).
 */
export const listaEmpresas = async (data: FiltrosEmpresasQuery)
: Promise<ApiResponse<FilaEmpresa[]>> => {

    const verificarUser = await verificarAutenticacion();
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

    params.append("pagina", String(data.pagina));
    params.append("limit", String(data.limit));
    if (data.razon_social) params.append("razon_social", data.razon_social);
    if (data.estado) params.append("estado", data.estado);

    const ruta = `${PAGINA}api/empresa_lista?${params.toString()}`;

    return await apiFetch<FilaEmpresa[]>(ruta, {
        method: "GET"
    });
};

/**
 * Lo que el front manda al crear una empresa (POST /api/empresa_alta).
 *
 * El logo es OPCIONAL y viaja como archivo en el campo `logo`.
 * `estado` y `fecha_creacion` los pone el server.
 */
export interface EmpresaAltaInput {
    razon_social: string;
    domicilio: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    /** JPG, PNG o WEBP. El server lo rechaza con 400 si pasa de 2 MB. */
    logo?: File | null;
}

/**
 * Alta de empresa (POST /api/empresa_alta).
 *
 * Va como **multipart/form-data** (`uploadLogo.single("logo")`): por eso el
 * `apiFetch` detecta el `FormData` y NO pone `Content-Type`, para que el
 * navegador arme el `boundary` solo.
 *
 * Las tres redes se mandan solo si tienen algo: vacías se guardan en NULL en
 * vez de en cadena vacía.
 *
 * Respuestas del server:
 * - `EMPRESA_ALTA_OK` (200).
 * - `FORMATO_LOGO_INVALIDO` / `TAMANO_LOGO_INVALIDO` (400): solo JPG, PNG o
 *   WEBP, y hasta 2 MB.
 * - `ERROR_SUBIR_LOGO` (500) / `NOT_AUTHENTICATED` (401).
 *
 * @param data - Datos de la empresa y el logo opcional.
 * @returns Respuesta estandarizada.
 */
export const postEmpresa = async (data: EmpresaAltaInput)
: Promise<ApiResponse<FilaEmpresa>> => {

    const verificarUser = await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }

    const formData = new FormData();

    formData.append("razon_social", data.razon_social);
    formData.append("domicilio", data.domicilio);
    if (data.whatsapp) formData.append("whatsapp", data.whatsapp);
    if (data.instagram) formData.append("instagram", data.instagram);
    if (data.facebook) formData.append("facebook", data.facebook);
    if (data.logo) formData.append("logo", data.logo);

    const ruta = `${PAGINA}api/empresa_alta`;

    return await apiFetch<FilaEmpresa>(ruta, {
        method: "POST",
        body: formData
    });
};

/**
 * Lo que el front manda al modificar una empresa (PUT /api/empresa_mod).
 *
 * Todos los campos son opcionales **menos `id_empresa`**, igual que en el schema
 * del server: lo que no llega, no se modifica (el `SET` se arma dinámico).
 * El formulario de modificación manda los 5 textos, pero la **reactivación**
 * (un PUT con solo `estado: "activos"`) se apoya justamente en esto.
 *
 * `cambia_logo` NO se manda: lo pone el controlador cuando llega un archivo.
 */
export interface EmpresaModInput {
    id_empresa: number;
    razon_social?: string;
    domicilio?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    /** "activos" | "inactivos". Es lo que permite reactivar una empresa dada
     *  de baja sin tocar nada más. */
    estado?: "activos" | "inactivos";
    /** Si no viene, el server conserva el logo actual. */
    logo?: File | null;
}

/**
 * Modificación de empresa (PUT /api/empresa_mod).
 *
 * También multipart. Cada campo se manda **solo si viene**: si se mandaran
 * siempre (aunque vinieran vacíos), no habría forma de dejar de modificar uno,
 * y la reactivación — que solo quiere cambiar `estado` — pisaría el resto con
 * cadenas vacías.
 *
 * El `.refine()` del schema pide al menos un campo a modificar.
 *
 * Respuestas del server:
 * - `EMPRESA_MOD_OK` (200).
 * - `EMPRESA_NO_ENCONTRADA` / `MODIFICAR_NOT_FOUND` (404).
 * - `FORMATO_LOGO_INVALIDO` / `TAMANO_LOGO_INVALIDO` (400).
 * - `ERROR_SUBIR_LOGO` (500) / `NOT_AUTHENTICATED` (401).
 *
 * @param data - `id_empresa` y los campos a cambiar (los que no vengan, no se tocan).
 * @returns Respuesta estandarizada.
 */
export const putEmpresa = async (data: EmpresaModInput)
: Promise<ApiResponse<FilaEmpresa>> => {

    const verificarUser = await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }

    const formData = new FormData();

    formData.append("id_empresa", String(data.id_empresa));
    // Cada campo solo si viene: `undefined` = no se manda = el server no lo toca
    if (data.razon_social !== undefined) formData.append("razon_social", data.razon_social);
    if (data.domicilio !== undefined) formData.append("domicilio", data.domicilio);
    if (data.whatsapp !== undefined) formData.append("whatsapp", data.whatsapp);
    if (data.instagram !== undefined) formData.append("instagram", data.instagram);
    if (data.facebook !== undefined) formData.append("facebook", data.facebook);
    if (data.estado) formData.append("estado", data.estado);
    if (data.logo) formData.append("logo", data.logo);

    const ruta = `${PAGINA}api/empresa_mod`;

    return await apiFetch<FilaEmpresa>(ruta, {
        method: "PUT",
        body: formData
    });
};

/**
 * Lo que el front manda al dar de baja una empresa: solo el id.
 *
 * El id viaja en el **body**, no en la URL (a diferencia de los dos `DELETE`
 * que ya había en el cliente, que lo mandan en el path).
 */
export interface EmpresaBajaInput {
    id_empresa: number;
}

/**
 * Baja **LÓGICA** de empresa (DELETE /api/empresa_baja): la fila queda con
 * `estado = "inactivos"`, **no se borra**. Para volver atrás es un PUT normal
 * con `estado: "activos"`.
 *
 * `apiFetch` pasa el body por `JSON.stringify` con `Content-Type:
 * application/json`, y el `express.json()` global del server lo parsea también
 * en un DELETE.
 *
 * Respuestas del server:
 * - `EMPRESA_BAJA_OK` (200).
 * - `EMPRESA_NO_ENCONTRADA` / `MODIFICAR_NOT_FOUND` (404): pasa si ya estaba
 *   dada de baja (el `WHERE` del hook filtra por `estado = 'activos'`).
 * - `NOT_AUTHENTICATED` (401) / `ERROR_SERVIDOR` (500).
 *
 * @param data - `id_empresa` de la fila a dar de baja.
 * @returns Respuesta estandarizada.
 */
export const deleteEmpresa = async (data: EmpresaBajaInput)
: Promise<ApiResponse<EmpresaBajaInput>> => {

    const verificarUser = await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }

    const ruta = `${PAGINA}api/empresa_baja`;

    return await apiFetch<EmpresaBajaInput>(ruta, {
        method: "DELETE",
        body: data
    });
};