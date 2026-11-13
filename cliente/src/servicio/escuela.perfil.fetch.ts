import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../utils/apiFetch";

/**
 * Datos de la escuela que se muestran en la sección "Logo de mi escuela".
 *
 * El servidor **nunca** expone `public_id`: solo la URL pública del logo
 * (o `null` cuando la escuela no tiene logo).
 */
export interface EscuelaPerfil {
  /** Id de la escuela del token (el cliente no lo envía en ninguna request) */
  id_escuela: number;
  /** Razón social; el servidor manda "Mi escuela" cuando la columna es `NULL` */
  razon_social: string;
  /** URL pública del logo o `null` si la escuela no tiene logo */
  urlImagen: string | null;
}

/**
 * Obtiene la escuela del usuario autenticado. El `id_escuela` sale del token,
 * por eso la request no lleva body, query ni params.
 *
 * @returns Promesa con `data: { id_escuela, razon_social, urlImagen }`
 */
export const getEscuelaPerfil = async (): Promise<ApiResponse<EscuelaPerfil>> => {
  const ruta = `${PAGINA}api/usuario_perfil/escuela`;
  return await apiFetch<EscuelaPerfil>(ruta, {
    method: "GET",
    credentials: "include",
  });
};

/**
 * Sube o reemplaza el logo de la escuela.
 *
 * Va como `multipart/form-data` con el campo único `imagen` y **sin**
 * `Content-Type` manual: `apiFetch` deja que el navegador agregue el boundary.
 *
 * @param file - Archivo elegido por el usuario (el servidor revalida formato y tamaño)
 * @returns Promesa con la escuela ya actualizada (`urlImagen` con la URL nueva)
 */
export const putLogoEscuela = async (file: File): Promise<ApiResponse<EscuelaPerfil>> => {
  const ruta = `${PAGINA}api/usuario_perfil/escuela/logo`;
  const body = new FormData();
  body.append("imagen", file);

  return await apiFetch<EscuelaPerfil>(ruta, {
    method: "PUT",
    body,
    credentials: "include",
  });
};

/**
 * Quita el logo de la escuela (deja `urlImagen` y `public_id` en `NULL`).
 * El endpoint es idempotente y no lleva body.
 *
 * @returns Promesa con la escuela sin logo (`urlImagen: null`)
 */
export const deleteLogoEscuela = async (): Promise<ApiResponse<EscuelaPerfil>> => {
  const ruta = `${PAGINA}api/usuario_perfil/escuela/logo`;
  return await apiFetch<EscuelaPerfil>(ruta, {
    method: "DELETE",
    credentials: "include",
  });
};
