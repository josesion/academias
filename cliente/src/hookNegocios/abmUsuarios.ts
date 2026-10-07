import { getCuentasAlumno, getCuentasUsuarios, postUsuarios, putUsuarios } from "../servicio/usuarios.admin.fetch";
// Opciones del selector de escuela: mismo endpoint que el formulario de
// suscripciones (GET /api/esc_plan_list) — decisión de la spec 006
import { getEscPlanes } from "../servicio/suspcripciones.fetch";
import { useLogicaUsuarios } from "../hooks/Administrador/Usuarios";

/**
 * Arma la configuración de servicios y llama a la lógica de la pantalla
 * de Cuentas (los 2 listados, el selector de escuela y el alta/modificación
 * de cuentas).
 *
 * Se llama `useAmbUsuarios` (y no `set…`): `rules-of-hooks` solo acepta que
 * una función llame a un hook si ella también empieza con `use` o es
 * PascalCase — mismo motivo por el que suscripciones usa `SuscripcionesLogica`.
 *
 * @returns El estado de la pantalla y sus handlers.
 */
export const useAmbUsuarios = () => {

    const config = {
        servicios: {
            getCuentasAlumno,
            getCuentasUsuarios,
            getEscPlanes,
            postUsuarios,
            putUsuarios,
        },
    };

    return useLogicaUsuarios(config);
};
