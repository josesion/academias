import { listaAnunciosPublicos } from "../servicio/anuncios.publico.fetch";
import { useLogicaAnunciosPublicos } from "../hooks/SeccionAlumnos/AnunciosPublicos";

/**
 * Arma la configuración de servicios y llama a la lógica del carrusel público
 * de anuncios (spec 019).
 *
 * Se llama `useAmbAnunciosPublicos` (y no `set…`): `rules-of-hooks` solo acepta
 * que una función llame a un hook si ella también empieza con `use` o es
 * `PascalCase` — mismo motivo por el que cuentas usa `useAmbUsuarios`.
 *
 * A diferencia del `abmAnuncios` del administrador, acá **no se inyectan** los
 * servicios de escritura: el alumno solo lee. Así el hook del alumno no tiene
 * forma de disparar un POST/PUT/DELETE aunque alguien lo invoque por error.
 *
 * @returns El estado del carrusel y sus handlers.
 */
export const useAmbAnunciosPublicos = () => {

    const config = {
        servicios: {
            listaAnunciosPublicos,
        },
    };

    return useLogicaAnunciosPublicos(config);
};