import { useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuImageOff,
  LuTrash2,
} from "react-icons/lu";
import { EstadoVacio } from "../../SeccionAlumnos/EstadoVacio/EstadoVacio";
import { EliminarVentana } from "../../generales/EliminarModal/EliminarModal";

import "./carruselflayers.css";

export interface Flayer {
  id_flayer: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
}

interface CarruselProps {
  flayers: Flayer[] | null;
  onEliminar?: (idFlayer: number) => void; // <--- Prop opcional para manejar la baja
  modalEliminar?: boolean;
  carga: boolean;
  mensaje: string;
}

export const CarruselFlayers = ({ flayers, onEliminar }: CarruselProps) => {
  const [indiceActual, setIndiceActual] = useState(0);

  // Si todavía está cargando o viene null/vacío, mostramos un placeholder elegante
  if (!flayers || flayers.length === 0) {
    return (
      <EstadoVacio
        variante="grande"
        icono={<LuImageOff size={34} />}
        titulo="Sin flyers por el momento"
        mensaje="Cuando las academias publiquen novedades, van a aparecer acá."
      />
    );
  }

  const total = flayers.length;
  const indiceAnterior = indiceActual === 0 ? total - 1 : indiceActual - 1;
  const indiceSiguiente = indiceActual === total - 1 ? 0 : indiceActual + 1;

  const flayerActual = flayers[indiceActual];
  const flayerAnterior = flayers[indiceAnterior];
  const flayerSiguiente = flayers[indiceSiguiente];

  const irAnterior = () => setIndiceActual(indiceAnterior);
  const irSiguiente = () => setIndiceActual(indiceSiguiente);

  return (
    <div className="carrusel_contenedor">
      <div className="carrusel_pista">
        {/* Peek: flyer anterior */}
        {total > 1 && (
          <button
            className="carrusel_peek carrusel_peek_izq"
            type="button"
            onClick={irAnterior}
            aria-label={`Ver flyer anterior: ${flayerAnterior.titulo}`}
          >
            <img src={flayerAnterior.imagen_url} alt="" />
          </button>
        )}

        {/* Lienzo principal */}
        <div className="carrusel_lienzo">
          <div
            className="carrusel_lienzo_fondo"
            style={{ backgroundImage: `url(${flayerActual.imagen_url})` }}
          />
          <img
            key={flayerActual.id_flayer}
            src={flayerActual.imagen_url}
            alt={flayerActual.titulo}
            className="carrusel_imagen"
          />
        </div>

        {/* Peek: flyer siguiente */}
        {total > 1 && (
          <button
            className="carrusel_peek carrusel_peek_der"
            type="button"
            onClick={irSiguiente}
            aria-label={`Ver flyer siguiente: ${flayerSiguiente.titulo}`}
          >
            <img src={flayerSiguiente.imagen_url} alt="" />
          </button>
        )}
      </div>

      <div className="carrusel_info">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <p className="carrusel_titulo">{flayerActual.titulo}</p>

          {/* Botón para eliminar el flyer activo */}
          {onEliminar && (
            <button
              type="button"
              className="carrusel_btn_eliminar"
              onClick={() => onEliminar(flayerActual.id_flayer)}
              aria-label="Eliminar flyer"
              title="Eliminar este flyer"
            >
              <LuTrash2 size={18} />
            </button>
          )}
        </div>
        <p className="carrusel_descripcion">{flayerActual.descripcion}</p>
      </div>

      <div className="carrusel_controles">
        <button
          className="carrusel_btn_flecha"
          type="button"
          onClick={irAnterior}
          aria-label="Flyer anterior"
        >
          <LuChevronLeft size={18} />
        </button>

        <div className="carrusel_dots">
          {flayers.map((flayer, i) => (
            <span
              key={flayer.id_flayer}
              className={`carrusel_dot ${i === indiceActual ? "activo" : ""}`}
            />
          ))}
        </div>

        <button
          className="carrusel_btn_flecha"
          type="button"
          onClick={irSiguiente}
          aria-label="Flyer siguiente"
        >
          <LuChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
