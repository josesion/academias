import React from "react";

// Seccion iconos
import { CgChevronLeft, CgChevronRight } from "react-icons/cg";

import "./paginacion.css";

// Componente Paginacion
type PaginacionProps = {
  paginaActual: number;
  contadorPagina: number;
  onPaginaCambiada: (pagina: number) => void;
  /**
   * Etiqueta accesible del landmark <nav> que envuelve la paginación.
   * Debe describir la pantalla donde se usa (ej. "Paginación del listado de cajas").
   * Si no se pasa (o viene vacía) se usa el valor por defecto "Paginación".
   */
  ariaLabel?: string;
};

type PageItem = number | "...";

export const Paginacion = ({
  paginaActual,
  contadorPagina,
  onPaginaCambiada,
  ariaLabel,
}: PaginacionProps) => {
  // Función para manejar los clics. Simplemente llama a la función pasada por prop.
  const handleClick = (numeroPagina: number) => {
    onPaginaCambiada(numeroPagina);
  };

  // Lógica para generar los números de página visibles
  const generarPaginasVisibles = (): PageItem[] => {
    const paginas = new Set<number>();

    // Siempre incluimos la primera y la última página
    paginas.add(1);
    paginas.add(contadorPagina);

    // Agregamos un rango de páginas alrededor de la página actual
    for (let i = -1; i <= 1; i++) {
      const p = paginaActual + i;
      if (p >= 1 && p <= contadorPagina) {
        paginas.add(p);
      }
    }

    // Convertir a array ordenado de números
    const numerosOrdenados = Array.from(paginas).sort((a, b) => a - b);

    // Agregar "..." donde corresponda
    const resultado: PageItem[] = [];
    numerosOrdenados.forEach((num, idx) => {
      if (idx > 0) {
        const prev = numerosOrdenados[idx - 1];
        if (num - prev > 1) {
          resultado.push("...");
        }
      }
      resultado.push(num);
    });

    return resultado;
  };

  const paginasVisibles = generarPaginasVisibles();

  return (
    <nav
      className="paginacion_contenedor"
      role="navigation"
      aria-label={ariaLabel?.trim() || "Paginación"}
    >
      <div className="paginacion_componente">
        <div className="paginacion_izquierda">
          <button
            onClick={() => handleClick(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="btn_nav"
            aria-label="Página anterior"
            aria-disabled={paginaActual === 1}
          >
            <CgChevronLeft size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="paginacion_centro">
          {paginasVisibles.map((item, index) => (
            <React.Fragment key={index}>
              {item === "..." ? (
                <span className="puntos_suspensivos" aria-hidden="true">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => handleClick(item)}
                  className={
                    item === paginaActual ? "btn_seleccionado" : "btn_generico"
                  }
                  aria-label={`Página ${item}`}
                  aria-current={item === paginaActual ? "page" : undefined}
                >
                  {item}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="paginacion_derecha">
          <button
            onClick={() => handleClick(paginaActual + 1)}
            disabled={paginaActual === contadorPagina}
            className="btn_nav"
            aria-label="Página siguiente"
            aria-disabled={paginaActual === contadorPagina}
          >
            <CgChevronRight size={22} aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
};