//Seccion de compónentes
import { Formulario } from "../../../componentes/generales/Formulario/Formulario";
//import { EscudoGray } from "../../../componentes/Animaciones/EscudoGrey";

//seccion de Stilos
import "../Login/login.css";

import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RutasProtegidasContext } from "../../../contexto/protectRutas";
import { loginLogica } from "../../../hooks/login";

export const Login = () => {
  const navegar = useNavigate();
  const { autenticado, rol } = useContext(RutasProtegidasContext);

  // Si ya hay sesión válida, redirige a su panel (evita ver login logueado)
  useEffect(() => {
    if (autenticado) {
      if (rol?.rol === "administrador") {
        navegar("/assistant_manager_priv", { replace: true });
      } else if (rol?.rol === "alumno") {
        navegar("/alumno_principal", { replace: true });
      } else {
        navegar("/user_manager_priv", { replace: true });
      }
    }
  }, [autenticado, rol, navegar]);

  const {
    errorGenerico,
    errorsZod,
    handleCancelar,
    handleChange,
    handleSubmit,
    inputsLogin,
    dataLogin,
  } = loginLogica();

  return (
    <div className="login_pagina_contenedor">
      <Formulario
        data={inputsLogin}
        textoSubmit="Iniciar Sesión"
        tituloFormulario="Iniciar Sesión"
        formData={dataLogin}
        onCancelar={handleCancelar}
        onSubmit={handleSubmit}
        onChange={handleChange}
        errorsZod={errorsZod}
        errorGenerico={errorGenerico}
      />
    </div>
  );
};
