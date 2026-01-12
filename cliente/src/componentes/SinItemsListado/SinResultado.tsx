import "./sinResultados.css";
// Puedes usar un icono de react-icons si tienes, o dejarlo solo con texto
import { VscSearchStop } from "react-icons/vsc";

export const SinResultado = () => {
  return (
    <div className="sin_resultado_contenedor">
      <div className="sin_resultado_card">
        <VscSearchStop className="sin_resultado_icono" />
        <p className="sin_resultado_texto">No se encontraron resultados</p>
        <span className="sin_resultado_subtexto">
          Intenta ajustar los filtros de búsqueda
        </span>
      </div>
    </div>
  );
};
