import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import type { CSSProperties } from "react";

import { RutasProtegidasContext } from "../../../contexto/protectRutas";

import "./notfound.css";

/** Cantidad de pasos del rastro. El último es el "paso que falta". */
const CANTIDAD_PASOS = 6;
const PASOS = Array.from({ length: CANTIDAD_PASOS }, (_, i) => i);

/**
 * Página 404 (spec 018).
 *
 * Antes no existía ninguna ruta `path="*"`: una URL mal escrita dejaba la
 * pantalla en blanco, sin explicación. Esta página es la que atiende todo lo
 * que no matchea con ninguna otra ruta.
 *
 * Concepto visual: "diste un paso en falso". Un rastro de pasos de baile que
 * termina en un paso punteado (el que falta), bajo un reflector de escenario.
 * Toda la ilustración es decorativa (`aria-hidden`).
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
    // NO va `<main>` ni `role="main"`: el layout ya aporta el unico landmark
    // `main` de la pagina. Un segundo `main` anidado es invalido.
    <section className="notfound" aria-labelledby="notfound-titulo">
      {/* Rastro de pasos de baile: decorativo */}
      <svg
        className="notfound_pasos"
        viewBox="0 0 330 80"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <path
            id="notfound-paso"
            d="M-5 -13 C-5 -18 5 -18 6 -12 C8 -5 3 1 2 8 C2 14 -4 14 -4 8 C-5 2 -7 -5 -5 -13Z"
          />
        </defs>
        {PASOS.map((i) => {
          const x = 30 + i * 54;
          const y = i % 2 === 0 ? 28 : 52; // pie izquierdo / derecho
          const espejo = i % 2 === 0 ? 1 : -1;
          const falta = i === CANTIDAD_PASOS - 1;

          return (
            <use
              key={i}
              href="#notfound-paso"
              transform={`translate(${x} ${y}) rotate(90) scale(${espejo} 1)`}
              className={falta ? "paso paso--falta" : "paso"}
              style={{ "--i": i } as CSSProperties}
            />
          );
        })}
      </svg>

      <h1 className="notfound_codigo" aria-label="Error 404">
        4<span className="notfound_cero">0</span>4
      </h1>
      <h2 id="notfound-titulo" className="notfound_titulo">
        Diste un paso en falso
      </h2>
      <p className="notfound_texto" role="status" aria-live="polite">
        No encontramos esta página: la dirección no existe o cambió de lugar.
        Revisá el enlace o volvé al panel para retomar el ritmo.
      </p>

      <div className="notfound_botones">
        <button
          type="button"
          className="boton boton--aceptar"
          onClick={irAlPanel}
        >
          Volver al panel
        </button>

        <Link className="boton boton--cancelar" to="/">
          Ir al inicio
        </Link>
      </div>
    </section>
  );
};
