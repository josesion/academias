import { useState, useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { RutasProtegidasContext } from "./contexto/protectRutas";
import { VerificarPermisos } from "./servicio/permisosRutas";
import { esSesionVencida } from "./hooks/verificacionUsuario";
import { ComponenteCargando } from "./componentes/generales/Cargando/Cargando";
import { ModalVencimiento } from "./componentes/ModalVencimiento/ModalVencimiento";
import { ModalSinSuscripcion } from "./componentes/ModalSinSuscripcion/ModalSinSuscripcion";

/**
 * Normaliza y verifica si la escuela no tiene ninguna suscripción registrada.
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

  // 1. Verificación inicial de sesión y carga de permisos al montar la ruta privada
  useEffect(() => {
    async function verificarAutenticacionInicial() {
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
        if (esSesionVencida(resultToken)) cerrarSesion();
      }

      setCargando(false);
    }

    verificarAutenticacionInicial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //  Pantalla de carga mientras se verifica el token inicial
  if (cargando) {
    return <ComponenteCargando />;
  }

  // 🛡️ Defensa: estado inconsistente o usuario no autenticado
  if (!autenticado) {
    if (rol?.rol !== "visita") cerrarSesion();
    return <Navigate to="/login" replace />;
  }

  // 💳 Lógica de suscripción (Solo para rol "usuario" / dueño de escuela)
  const esRolUsuario = rol?.rol === "usuario";
  const sinSuscripcion =
    esRolUsuario && esSinSuscripcion(rol?.estado_suscripcion);
  const estaVencido = esRolUsuario && rol?.estado_suscripcion === "vencido";

  // 🔒 Bloqueos por estado de suscripción
  if (sinSuscripcion) {
    return <ModalSinSuscripcion abierto />;
  }

  if (estaVencido) {
    return <ModalVencimiento abierto />;
  }

  return <Outlet />;
};
