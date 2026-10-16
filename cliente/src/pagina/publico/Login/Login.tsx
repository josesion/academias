import { useEffect, useContext, useId } from "react";
import { useNavigate } from "react-router-dom";

// Seccion de componentes
import { Formulario } from "../../../componentes/generales/Formulario/Formulario";

// Seccion de estilos
import "../Login/login.css";

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

  const formId = useId();

  return (
    // NO va `role="main"` ni `<main>`: el layout (`menuManager.tsx`) ya
    // aporta el unico `<main id="contenido_principal">` de la pagina, que es
    // ademas el destino del skip link. Poner un segundo `<main>` aqui deja
    // dos landmarks principales, que WCAG no permite.
    <div className="login_pagina_contenedor">
      {/* El h1 va oculto a la vista porque el `Formulario` ya pinta su propio
          título visible ("Iniciar Sesión"); lo que faltaba era el <h1> de la
          página, para que el lector de voz anuncie un título nivel 1. */}
      <header>
        <h1 className="visually-hidden">Iniciar sesión en ELPHIS</h1>
      </header>

      <section aria-labelledby={formId} className="login_pagina_seccion">
        <h2 id={formId} className="visually-hidden">
          Formulario de acceso
        </h2>
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
      </section>
    </div>
  );
};
