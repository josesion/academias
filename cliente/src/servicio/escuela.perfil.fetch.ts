import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../utils/apiFetch";

/**
 * Datos mínimos de la escuela para la sección del logo.
 * Se usa en `useLogoEscuela` y `logoEscuela.reducer`.
 */
export interface EscuelaPerfil {
  id_escuela: number;
  razon_social: string;
  urlImagen: string | null;
  public_id: string | null;
}

/**
 * Datos de la escuela del usuario logueado (spec 051).
 * Se obtienen directamente de `GET /api/usuario_perfil/escuela` que ya
 * existe en el backend y devuelve todos los campos de la escuela.
 */
export interface EscuelaPerfilDatos {
  id_escuela: number;
  razon_social: string;
  direccion: string | null;
  celular: string | null;
  rubro: string | null;
  descripcion: string | null;
  urlImagen: string | null;
}

/**
 * Campos editables del formulario de datos de escuela en el perfil.
 */
export interface EscuelaPerfilInputs {
  razon_social?: string;
  direccion?: string;
  celular?: string;
  descripcion?: string;
}

/**
 * Obtiene los datos completos de la escuela del usuario logueado.
 * Usa `GET /api/usuario_perfil/escuela` que ya existe en el backend y devuelve
 * todos los campos de la escuela asociada al usuario autenticado.
 *
 * @returns Promesa con los datos de la escuela
 */
export const getMiEscuela = async (): Promise<ApiResponse<EscuelaPerfilDatos>> => {
  const ruta = `${PAGINA}api/usuario_perfil/escuela`;
  return await apiFetch<EscuelaPerfilDatos>(ruta, {
    method: "GET",
    credentials: "include",
  });
};

/**
 * Actualiza los datos de la escuela del usuario logueado.
 * Usa `PUT /api/usuario_perfil/escuela` que identifica la escuela por
 * `req.usuario.id_escuela` del token (spec 051).
 *
 * @param datos - Campos a actualizar (todos opcionales)
 * @returns Promesa con el resultado de la actualización
 */
export const putMiEscuela = async (
  datos: EscuelaPerfilInputs
): Promise<ApiResponse<{ id_escuela: number }>> => {
  const ruta = `${PAGINA}api/usuario_perfil/escuela`;
  return await apiFetch(ruta, {
    method: "PUT",
    body: datos,
    credentials: "include",
  });
};

/* ==========================================================================
   FUNCIONES PARA EL LOGO DE LA ESCUELA
   Se usan en `useLogoEscuela` y `abmLogoEscuela`.
   ========================================================================== */

/**
 * Obtiene los datos mínimos de la escuela del usuario logueado para la sección
 * del logo (solo id, urlImagen y public_id).
 *
 * @returns Promesa con los datos del logo de la escuela
 */
export const getEscuelaPerfil = async (): Promise<ApiResponse<EscuelaPerfil>> => {
  const ruta = `${PAGINA}api/usuario_perfil/escuela`;
  return await apiFetch(ruta, {
    method: "GET",
    credentials: "include",
  });
};

/**
 * Sube el logo de la escuela del usuario logueado.
 *
 * @param file - Archivo de imagen (JPG, PNG, WEBP, máx 2 MB)
 * @returns Promesa con los datos actualizados de la escuela
 */
export const putLogoEscuela = async (
  file: File
): Promise<ApiResponse<EscuelaPerfil>> => {
  const ruta = `${PAGINA}api/usuario_perfil/escuela/logo`;
  const formData = new FormData();
  formData.append("imagen", file);
  return await apiFetch(ruta, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });
};

/**
 * Quita el logo de la escuela del usuario logueado.
 *
 * @returns Promesa con los datos actualizados de la escuela
 */
export const deleteLogoEscuela = async (): Promise<ApiResponse<EscuelaPerfil>> => {
  const ruta = `${PAGINA}api/usuario_perfil/escuela/logo`;
  return await apiFetch(ruta, {
    method: "DELETE",
    credentials: "include",
  });
};
