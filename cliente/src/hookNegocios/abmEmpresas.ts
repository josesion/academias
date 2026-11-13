import {
    listaEmpresas,
    postEmpresa,
    putEmpresa,
    deleteEmpresa,
} from "../servicio/empresas.fetch";
// El listado de anuncios por empresa vive en `anuncios.fetch`: la página de
// empresas lo usa para el panel de "qué avisos tiene esta empresa"
import { listaAnunciosEmpresa } from "../servicio/anuncios.fetch";
import { useLogicaEmpresas } from "../hooks/Administrador/Empresas";

/**
 * Arma la configuración de servicios y llama a la lógica de la pantalla de
 * Empresas (listado con filtros, alta, modificación, baja lógica, reactivación
 * y el panel con los anuncios de la empresa clickeada).
 *
 * Se llama `useAmbEmpresas` (y no `set…`): `rules-of-hooks` solo acepta que
 * una función llame a un hook si ella también empieza con `use` o es
 * PascalCase — mismo motivo por el que cuentas usa `useAmbUsuarios`.
 *
 * @returns El estado de la pantalla y sus handlers.
 */
export const useAmbEmpresas = () => {

    const config = {
        servicios: {
            listaEmpresas,
            postEmpresa,
            putEmpresa,
            deleteEmpresa,
            listaAnunciosEmpresa,
        },
    };

    return useLogicaEmpresas(config);
};