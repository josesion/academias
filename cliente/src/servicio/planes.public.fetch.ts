import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import type { PlanSaasRow } from "./administrador.fetch";

export interface FiltroPlanes {
  estado: string;
}

export const getPlanesPublicos = async (
  filtro: FiltroPlanes
): Promise<ApiResponse<PlanSaasRow[]>> => {
  const ruta = `${PAGINA}api/lista_planes_saas/${filtro.estado}`;
  return await apiFetch<PlanSaasRow[]>(ruta, {
    method: "GET",
  });
};