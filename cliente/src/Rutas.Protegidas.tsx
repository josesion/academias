import { useState, useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { RutasProtegidasContext } from "./contexto/protectRutas";
import { VerificarPermisos } from "./servicio/permisosRutas";
import { ComponenteCargando } from "./componentes/generales/Cargando/Cargando";
import { ModalVencimiento } from "./componentes/ModalVencimiento/ModalVencimiento";
// 👈 Ajustá la ruta de tu componente

export const RutasPrivadas = () => {
  const { autenticado, setAutenticado, setUsuarioInfo, rol, setRol } =
    useContext(RutasProtegidasContext);
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
  const esRolUsuario = rol?.rol === "usuario";
  const estaVencido = rol?.estado_suscripcion === "vencido" ? true : false;

  return (
    <>
      {/* Permitimos que la vista cargue con total normalidad */}
      <Outlet />

      {/* Si es el dueño (rol 'usuario') y está vencido, le encajamos el modal flotante para avisarle */}
      {esRolUsuario && <ModalVencimiento abierto={estaVencido} />}
    </>
  );
};
