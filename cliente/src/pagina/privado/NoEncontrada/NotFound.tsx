import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { MdOutlineSentimentDissatisfied } from "react-icons/md";

import { RutasProtegidasContext } from "../../../contexto/protectRutas";

import "./notfound.css";

/**
 * Página 404 (spec 018).
 *
 * Antes no existía ninguna ruta `path="*"`: una URL mal escrita dejaba la
 * pantalla en blanco, sin explicación. Esta página es la que atiende todo lo
 * que no matchea con ninguna otra ruta.
 *
 * `@react-router-dom` la muestra sola (`replace`, para que el botón "atrás"
 * del navegador no devuelva al usuario a la URL inválida).
 */
export const NotFound = () => {
  const navegar = useNavigate();
  const { autenticado, rol } = useContext(RutasProtegidasContext);

  /** Vuelve al panel del rol, o al inicio si no hay sesión. */
  const irAlPanel = () => {
    if (!autenticado) {
      navegar("/");
      return;
    }

    if (rol?.rol === "administrador") {
      navegar("/assistant_manager_priv");
      return;
    }

    if (rol?.rol === "alumno") {
      navegar("/alumno_principal");
      return;
    }

    navegar("/user_manager_priv");
  };

  return (
    <section className="notfound">
      <MdOutlineSentimentDissatisfied size={72} aria-hidden="true" />

      <h1 className="notfound_codigo">404</h1>
      <h2 className="notfound_titulo">No encontramos esta página</h2>
      <p className="notfound_texto">
        La dirección que abriste no existe o cambió de lugar. Revisá el enlace o
        volvé al panel para seguir trabajando.
      </p>

      <div className="notfound_botones">
        <button type="button" className="boton boton--aceptar" onClick={irAlPanel}>
          Volver al panel
        </button>

        <Link className="boton boton--cancelar" to="/">
          Ir al inicio
        </Link>
      </div>
    </section>
  );
};