import "./sinResultados.css";
import { VscSearchStop } from "react-icons/vsc";

interface SinResultadoProps {
  mensaje?: string;
  submensaje?: string;
}

export const SinResultado = ({
  mensaje = "No se encontraron registros",
  submensaje = "Intenta ajustar los filtros de búsqueda o agrega un nuevo elemento.",
}: SinResultadoProps) => {
  return (
    <div className="sin_resultado_contenedor">
      <div className="sin_resultado_card">
        {/* Sección de la animación sobria */}
        <div className="escena_busqueda">
          <div className="radar_anillo"></div>
          <div className="radar_anillo lento"></div>
          <div className="halo_ambiental_busqueda"></div>

          <div className="contenedor_icono_animado">
            <VscSearchStop className="sin_resultado_icono" />
          </div>
        </div>

        {/* Sección de textos */}
        <div className="texto_contenedor">
          <p className="sin_resultado_texto">{mensaje}</p>
          <span className="sin_resultado_subtexto">{submensaje}</span>
        </div>
      </div>
    </div>
  );
};
