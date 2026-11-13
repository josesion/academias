import { PAGINA } from "../variables.globales";
import { apiFetch, type ApiResponse } from "../../utils/apiFetch";

export interface RegistroGratuitoDatos {
  razon_social: string;
  direccion: string;
  celular: string;
  correo: string;
  rubro: "baile" | "gym";
  dni_propietario: number;
  nombre_propietario: string;
  apellido_propietario: string;
  usuario: string;
}

export interface RegistroGratuitoResultado {
  id_escuela: number;
  id_usuario: number;
}

export const registrarEscuelaGratuita = async (
  datos: RegistroGratuitoDatos
): Promise<ApiResponse<RegistroGratuitoResultado>> => {
  return await apiFetch<RegistroGratuitoResultado>(`${PAGINA}api/registro-escuela-gratuita`, {
    method: "POST",
    body: datos,
  });
};

export const verificarDisponibilidadUsuario = async (
  usuario: string,
  signal?: AbortSignal
): Promise<ApiResponse<{ disponible: boolean; usuario: string }>> => {
  return await apiFetch<{ disponible: boolean; usuario: string }>(
    `${PAGINA}api/registro-escuela-gratuita/disponible-usuario/${encodeURIComponent(usuario)}`,
    {
      method: "GET",
      signal,
    }
  );
};
