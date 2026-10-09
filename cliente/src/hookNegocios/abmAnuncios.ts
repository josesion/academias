import {
    listaAnuncios,
    postAnuncio,
    putAnuncio,
    deleteAnuncio,
} from "../servicio/anuncios.fetch";
// Empresas del selector: el mismo fetch de empresas que usa la página de
// empresas. El hook lo pide con `limit: 100` (el tope del server).
import { listaEmpresas } from "../servicio/empresas.fetch";
import { useLogicaAnuncios } from "../hooks/Administrador/Anuncios";

/**
 * Arma la configuración de servicios y llama a la lógica de la pantalla de
 * Anuncios (listado con sus 5 filtros, empresas del selector, alta,
 * modificación y baja física).
 *
 * Se llama `useAmbAnuncios` (y no `set…`): `rules-of-hooks` solo acepta que
 * una función llame a un hook si ella también empieza con `use` o es
 * PascalCase — mismo motivo por el que cuentas usa `useAmbUsuarios`.
 *
 * @returns El estado de la pantalla y sus handlers.
 */
export const useAmbAnuncios = () => {

    const config = {
        servicios: {
            listaAnuncios,
            postAnuncio,
            putAnuncio,
            deleteAnuncio,
            listaEmpresas,
        },
    };

    return useLogicaAnuncios(config);
};