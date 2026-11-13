import {
  getEscuelaPerfil,
  putLogoEscuela,
  deleteLogoEscuela,
} from "../servicio/escuela.perfil.fetch";
import { useLogoEscuela } from "../hooks/usuario/useLogoEscuela";

/**
 * Hook de negocio del logo de la escuela.
 * Inyecta los 3 servicios reales y delega la lógica en `useLogoEscuela`.
 *
 * Se llama `useAmbLogoEscuela` (empezando con `use`) para cumplir
 * `rules-of-hooks` — mismo patrón que `useAmbPerfilUsuario`.
 *
 * @returns El estado y los handlers que devuelve `useLogoEscuela`
 */
export const useAmbLogoEscuela = () => {

  const config = {
    servicios: {
      getEscuelaPerfil,
      putLogoEscuela,
      deleteLogoEscuela,
    },
  };

  return useLogoEscuela(config);
};
