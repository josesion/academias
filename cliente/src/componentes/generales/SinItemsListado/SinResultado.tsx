import "./sinResultados.css";
import { VscSearchStop } from "react-icons/vsc";

export const SinResultado = () => {
  return (
    <div className="sin_resultado_contenedor">
      <div className="sin_resultado_card">
        {/* Sección de la animación */}
        <div className="escena_busqueda">
          <div className="radar_anillo"></div>
          <div className="radar_anillo lento"></div>

          <div className="contenedor_icono_animado">
            <VscSearchStop className="sin_resultado_icono" />
          </div>

          <div className="punto_busqueda p1"></div>
          <div className="punto_busqueda p2"></div>
          <div className="punto_busqueda p3"></div>
        </div>

        {/* Sección de textos */}
        <div className="texto_contenedor">
          <p className="sin_resultado_texto">No se encontraron resultados</p>
          <span className="sin_resultado_subtexto">
            Intenta ajustar los filtros de búsqueda
          </span>
        </div>
      </div>
    </div>
  );
};
