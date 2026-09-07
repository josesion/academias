import { useState } from "react";
import { LuPlus, LuTrash2, LuX } from "react-icons/lu";
import { EliminarVentana } from "../../generales/EliminarModal/EliminarModal";
import { type Flayer } from "../Carrucel/CarruselFlayers";

import "./galeria.css";

interface GaleriaProps {
  flayers: Flayer[] | null;
  onEliminar?: (idFlayer: number) => void;
  onAgregar?: () => void;
  onAbrirModalEliminar: () => void;
  onCerrarModalEliminar: () => void;
  moodalEliminar: boolean;
  carga: boolean;
  mensaje: string;
  planFlayers?: number; // Límite máximo de flyers permitidos según el plan
}

export const GaleriaFlayers = ({
  flayers,
  onEliminar,
  onAgregar,
  onAbrirModalEliminar,
  onCerrarModalEliminar,
  moodalEliminar,
  carga,
  mensaje,
  planFlayers,
}: GaleriaProps) => {
  const [flayerAEliminar, setFlayerAEliminar] = useState<Flayer | null>(null);
  const [flayerDetalle, setFlayerDetalle] = useState<Flayer | null>(null);

  const cantidadActual = flayers?.length ?? 0;
  // Determina si se puede mostrar el botón de agregar según el límite de planFlayers
  const puedeAgregar = Boolean(
    onAgregar && (planFlayers === undefined || cantidadActual < planFlayers),
  );

  const abrirModalEliminarFlayer = (flayer: Flayer) => {
    setFlayerAEliminar(flayer);
    onAbrirModalEliminar();
  };

  const cerrarModalEliminar = () => {
    setFlayerAEliminar(null);
    onCerrarModalEliminar();
  };

  const confirmarEliminar = (flayer: Flayer) => {
    onEliminar?.(flayer.id_flayer);
    setFlayerDetalle(null); // Cierra el panel flotante de detalle
    cerrarModalEliminar(); // Cierra el modal de eliminación
  };

  return (
    <div className="galeria_contenedor_principal">
      {/* * MODAL: confirmación de eliminación */}
      {moodalEliminar && flayerAEliminar && (
        <div className="carrusel_modal_overlay" onClick={cerrarModalEliminar}>
          <div onClick={(e) => e.stopPropagation()}>
            <EliminarVentana
              data={flayerAEliminar}
              accion={`eliminar el flyer "${flayerAEliminar.titulo}"`}
              mensaje={mensaje}
              cargando={carga}
              onSi={confirmarEliminar}
              onCancelar={cerrarModalEliminar}
            />
          </div>
        </div>
      )}

      {/* * PANEL DESLIZABLE (DETALLE) */}
      {flayerDetalle && (
        <div
          className="galeria_drawer_overlay"
          onClick={() => setFlayerDetalle(null)}
        >
          <div
            className="galeria_drawer_contenido"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="galeria_drawer_cerrar"
              onClick={() => setFlayerDetalle(null)}
              aria-label="Cerrar detalle"
            >
              <LuX size={20} />
            </button>

            <div className="galeria_drawer_imagen_box">
              <img src={flayerDetalle.imagen_url} alt={flayerDetalle.titulo} />
            </div>

            <div className="galeria_drawer_info">
              <h3>{flayerDetalle.titulo}</h3>
              <p>{flayerDetalle.descripcion}</p>

              {onEliminar && (
                <button
                  type="button"
                  className="galeria_drawer_btn_eliminar"
                  onClick={() => abrirModalEliminarFlayer(flayerDetalle)}
                >
                  <LuTrash2 size={16} />
                  Eliminar este flyer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="galeria_grilla">
        {flayers?.map((flayer) => (
          <div
            key={flayer.id_flayer}
            className="galeria_tarjeta"
            onClick={() => setFlayerDetalle(flayer)}
          >
            <div className="galeria_imagen_wrapper">
              <img src={flayer.imagen_url} alt={flayer.titulo} />
            </div>
            <div className="galeria_info">
              <p className="galeria_titulo">{flayer.titulo}</p>
              <p className="galeria_descripcion">{flayer.descripcion}</p>
            </div>
          </div>
        ))}

        {puedeAgregar && onAgregar && (
          <button
            type="button"
            className="galeria_tarjeta_agregar"
            onClick={(e) => {
              e.stopPropagation();
              onAgregar();
            }}
            aria-label="Agregar flyer"
            title="Agregar flyer"
          >
            <LuPlus size={28} />
            <span>Agregar flyer</span>
          </button>
        )}
      </div>
    </div>
  );
};
