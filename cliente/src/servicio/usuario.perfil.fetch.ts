import { PAGINA } from "./variables.globales";
import { apiFetch, type ApiResponse } from "../utils/apiFetch";

/** Datos que el usuario puede modificar de su propio perfil */
export interface MiPerfilInputs {
  /** Contraseña actual (requerida para cualquier cambio) */
  contrasena_actual: string;
  /** Nuevo nombre de usuario (opcional) */
  nuevo_usuario?: string;
  /** Nuevo correo (opcional) */
  correo?: string;
  /** Nuevo celular (opcional) */
  celular?: string;
  /** Nueva contraseña (opcional) */
  nueva_contrasena?: string;
}

/** Respuesta del servidor tras actualizar el perfil */
export interface MiPerfilResult {
  usuario: string;
  rol: string;
  id_escuela: number;
}

/** Datos completos del perfil (respuesta del GET) */
export interface PerfilCompleto {
  usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  celular: string | null;
  rol: string;
  id_escuela: number;
}

/**
 * Obtiene los datos completos del perfil del usuario autenticado.
 * Útil para rellenar el formulario con email y celular actuales.
 *
 * @returns Promesa con los datos del perfil
 */
export const getMiPerfil = async (): Promise<ApiResponse<PerfilCompleto>> => {
  const ruta = `${PAGINA}api/usuario_perfil`;
  return await apiFetch(ruta, {
    method: "GET",
    credentials: "include",
  });
};

/**
 * Actualiza el perfil del usuario autenticado.
 * Requiere siempre `contrasena_actual`. Los demás campos son opcionales:
 * si no se envían, no se modifican.
 *
 * @param data - Datos a actualizar (contrasena_actual obligatoria)
 * @returns Promesa con el resultado de la actualización
 */
export const putMiPerfil = async (
  data: MiPerfilInputs
): Promise<ApiResponse<MiPerfilResult>> => {
  const ruta = `${PAGINA}api/usuario_perfil`;
  return await apiFetch(ruta, {
    method: "PUT",
    body: data,
    credentials: "include",
  });
};