import { getMiPerfil, putMiPerfil } from "../servicio/usuario.perfil.fetch";
import { useLogicaPerfil } from "../hooks/usuario/usePerfilUsuario";

/**
 * Hook de negocio del perfil de usuario.
 * Inyecta los servicios reales y llama a la lógica (`useLogicaPerfil`).
 *
 * Se llama `useAmbPerfilUsuario` (empezando con `use`) para cumplir
 * `rules-of-hooks` — mismo patrón que `useAmbUsuarios` en abmUsuarios.ts.
 */
export const useAmbPerfilUsuario = () => {

    const config = {
        servicios: {
            getMiPerfil,
            putMiPerfil,
        },
    };

    return useLogicaPerfil(config);
};