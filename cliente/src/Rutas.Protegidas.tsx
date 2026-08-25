import { useState, useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { RutasProtegidasContext } from "./contexto/protectRutas";
import { VerificarPermisos } from "./servicio/permisosRutas";
import { ComponenteCargando } from "./componentes/generales/Cargando/Cargando";

export const RutasPrivadas = () => {
  const { autenticado, setAutenticado, setUsuarioInfo, setRol } = useContext(
    RutasProtegidasContext,
  );
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function verificarAutenticacion() {
      const resultToken = await VerificarPermisos();

      if (resultToken.error === false) {
        setAutenticado(true);

        if (resultToken.data) {
          setUsuarioInfo({
            usuario: resultToken.data,
            error: false,
          });

          setRol(resultToken.data);
        }
      } else {
        setAutenticado(false);
        setUsuarioInfo(null);
      }

      setCargando(false);
    }

    verificarAutenticacion();
  }, []);

  if (cargando) {
    return <ComponenteCargando />;
  }
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};
