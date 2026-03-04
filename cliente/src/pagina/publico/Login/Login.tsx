//Seccion de compónentes
import { Formulario } from "../../../componentes/Formulario/Formulario";

//seccion de Stilos
import "../Login/login.css";

import { loginLogica } from "../../../hooks/login";

export const Login = () => {
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
