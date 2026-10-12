import "./sinResultados.css";
import { VscSearchStop } from "react-icons/vsc";
import { Boton } from "../Boton/Boton";

interface AccionProps {
  label: string;
  onClick: () => void;
}

interface SinResultadoProps {
  mensaje?: string;
  submensaje?: string;
  accion?: AccionProps;
}

export const SinResultado = ({
  mensaje = "No se encontraron registros",
  submensaje = "Intenta ajustar los filtros de búsqueda o agrega un nuevo elemento.",
  accion,
}: SinResultadoProps) => {
  const ariaLabel = `${mensaje}. ${submensaje}`;

  return (
    <div className="sin_resultado_contenedor" role="status" aria-live="polite" aria-label={ariaLabel}>
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

        {/* Acción opcional */}
        {accion && (
          <div className="sin_resultado_accion">
            <Boton
              clase="aceptar"
              logo="Add"
              texto={accion.label}
              onClick={accion.onClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};