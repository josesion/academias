import { useState, useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { RutasProtegidasContext } from "./contexto/protectRutas";
import { VerificarPermisos } from "./servicio/permisosRutas";
import { esSesionVencida } from "./hooks/verificacionUsuario";
import { ComponenteCargando } from "./componentes/generales/Cargando/Cargando";
import { ModalVencimiento } from "./componentes/ModalVencimiento/ModalVencimiento";
import { ModalSinSuscripcion } from "./componentes/ModalSinSuscripcion/ModalSinSuscripcion";

/**
 * Indica que la escuela todavía **no tiene ninguna suscripción** en la BD.
 *
 * El server manda dos valores distintos para el mismo caso según por dónde
 * se entre: `/api/verificar` devuelve `null` (LEFT JOIN sin filas) y
 * `POST /api/login` devuelve el string `"Sin fecha"`. Acá se normalizan los
 * dos, más `undefined` y el string vacío que puedan quedar en el contexto.
 *
 * @param estado - `estado_suscripcion` del contexto (`string | null`).
 * @returns `true` si no hay ninguna suscripción.
 */
const esSinSuscripcion = (estado?: string | null): boolean => {
  if (estado === null || estado === undefined) return true;

  const limpio = estado.trim();

  return limpio === "" || limpio === "Sin fecha";
};

export const RutasPrivadas = () => {
  const {
    autenticado,
    setAutenticado,
    setUsuarioInfo,
    rol,
    setRol,
    cerrarSesion,
  } = useContext(RutasProtegidasContext);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function verificarAutenticacion() {
      const resultToken = await VerificarPermisos();

      if (resultToken.error === false) {
        setAutenticado(true);

        if (resultToken.data) {
          setUsuarioInfo({
            usuario: resultToken.data.usuario,
            error: false,
          });

          setRol(resultToken.data);
        }
      } else {
        setAutenticado(false);
        setUsuarioInfo(null);
        // Sesión vencida de verdad → limpieza completa (`rol` incluido),
        // así la barra de navegación no queda con el usuario anterior.
        if (esSesionVencida(resultToken)) cerrarSesion();
      }

      setCargando(false);
    }

    verificarAutenticacion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Chequeo periódico del token: cada 60s y al volver a la pestaña.
   * Corre solo mientras se esté en una ruta privada (este componente está
   * montado); si el token ya no sirve, `cerrarSesion()` deja la barra en
   * "visita" y el `<Navigate>` de abajo manda al login.
   */
  useEffect(() => {
    const chequear = async () => {
      const resultToken = await VerificarPermisos();

      if (resultToken.error && esSesionVencida(resultToken)) {
        cerrarSesion();
      }
    };

    const intervalo = window.setInterval(chequear, 60_000);

    const alVolverALaPestana = () => {
      if (!document.hidden) chequear();
    };
    document.addEventListener("visibilitychange", alVolverALaPestana);

    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolverALaPestana);
    };
  }, [cerrarSesion]);

  if (cargando) {
    return <ComponenteCargando />;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  // Solo al dueño de la escuela (rol "usuario") le condiciona el estado de la suscripción
  const esRolUsuario = rol?.rol === "usuario";
  const sinSuscripcion =
    esRolUsuario && esSinSuscripcion(rol?.estado_suscripcion);
  const estaVencido = esRolUsuario && rol?.estado_suscripcion === "vencido";

  // 🔒 Bloqueo de ruta: NO se pinta el <Outlet />, solo el modal que corresponda.
  //    ("anulado" queda fuera a propósito: lo maneja el panel de Admin)
  if (sinSuscripcion) {
    return <ModalSinSuscripcion abierto />;
  }

  if (estaVencido) {
    return <ModalVencimiento abierto />;
  }

  return <Outlet />;
};
