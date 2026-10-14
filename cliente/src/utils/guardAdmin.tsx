import { type ReactNode, useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { RutasProtegidasContext } from "../contexto/protectRutas";

/**
 * Redirige al panel que le corresponde a un usuario que NO es administrador.
 *
 * No hace logout: un usuario o un alumno que escribe `/admin/...` en la barra
 * de direcciones simplemente vuelve a su propio panel y conserva la sesión.
 *
 * @param rol - El rol que viene del contexto (`"administrador"`, `"usuario"`,
 *   `"alumno"` o `"visita"`).
 * @returns Un `<Navigate>` al panel correspondiente.
 */
const IrAlPanelPropio = ({ rol }: { rol?: string }) => {
  if (rol === "administrador") {
    return <Navigate to="/assistant_manager_priv" replace />;
  }
  if (rol === "alumno") {
    return <Navigate to="/alumno_principal" replace />;
  }

  return <Navigate to="/user_manager_priv" replace />;
};

/**
 * Guard de rol para las rutas `/admin/*` (spec 018).
 *
 * Antes estas rutas no tenían ninguna protección en el cliente: el menú
 * escondía los ítems, pero escribir la URL a mano renderizaba la pantalla de
 * administración vacía y recién ahí el server respondía 403 en cada petición
 * que la pantalla disparaba.
 *
 * Con este guard la pantalla no llega a pintarse y no se disparan peticiones
 * que van a fallar.
 *
 * El bloqueo REAL sigue siendo del server (`permisos.soloAdministrador` en
 * `server/src/rutas/*.ruta.ts`): este guard es solo de experiencia, para no
 * mostrar una pantalla vacía.
 *
 * @returns `Outlet` si el rol es `administrador`; un `<Navigate>` en otro caso.
 */
export const SoloAdministrador = () => {
  const { autenticado, rol } = useContext(RutasProtegidasContext);

  // Sin sesión lo resuelve `RutasPrivadas` (redirige a `/login`); este caso es
  // solo defensivo para que el guard no quede nunca como única protección.
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rol?.rol === "administrador") {
    return <Outlet />;
  }

  return <IrAlPanelPropio rol={rol?.rol} />;
};

/**
 * Variante del guard que envuelve un subárbol con `children` en vez de usar
 * `Outlet`, para cuando las rutas no están anidadas bajo un layout.
 *
 * @param children - El subárbol a proteger.
 * @returns `children` si el rol es `administrador`; un `<Navigate>` en otro caso.
 */
export const SoloAdministradorWrapper = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { autenticado, rol } = useContext(RutasProtegidasContext);

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rol?.rol === "administrador") {
    return <>{children}</>;
  }

  return <IrAlPanelPropio rol={rol?.rol} />;
};

/**
 * Guard de rol para las rutas de USUARIO (dueño de escuela).
 *
 * Protege: `/user_*`, `/caja_*`, `/inscrip_*`, `/horario_*`, `/flayers`,
 * `/list_inscrip`, `/asistencia`, `/user_categoria_caja`, `/user_tipo_cuenta`.
 *
 * El bloqueo REAL sigue siendo del server (`validarPermiso` + `verificarPlan`);
 * este guard es solo de experiencia, para no mostrar una pantalla vacía.
 *
 * @returns `Outlet` si el rol es `usuario`; un `<Navigate>` a su panel en otro caso.
 */
export const SoloUsuario = () => {
  const { autenticado, rol } = useContext(RutasProtegidasContext);

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rol?.rol === "usuario") {
    return <Outlet />;
  }

  return <IrAlPanelPropio rol={rol?.rol} />;
};

/**
 * Guard de rol para rutas que pueden acceder TANTO usuario como alumno.
 * Protege: `/user_perfil` (perfil editable por ambos roles).
 */
export const SoloUsuarioOAlumno = () => {
  const { autenticado, rol } = useContext(RutasProtegidasContext);

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rol?.rol === "usuario" || rol?.rol === "alumno") {
    return <Outlet />;
  }

  return <IrAlPanelPropio rol={rol?.rol} />;
};

/**
 * Guard de rol para las rutas de ALUMNO.
 *
 * Protege: `/alumno_principal`, `/data_escuela`.
 *
 * El bloqueo REAL sigue siendo del server (`validarPermiso` + `soloAlumno`);
 * este guard es solo de experiencia.
 *
 * @returns `Outlet` si el rol es `alumno`; un `<Navigate>` a su panel en otro caso.
 */
export const SoloAlumno = () => {
  const { autenticado, rol } = useContext(RutasProtegidasContext);

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rol?.rol === "alumno") {
    return <Outlet />;
  }

  return <IrAlPanelPropio rol={rol?.rol} />;
};