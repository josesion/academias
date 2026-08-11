import { Boton } from "../../generales/Boton/Boton";
import { Calendar, Clock, Wallet, MessageSquare } from "lucide-react";

import "./detallecajas.css";

interface DetalleProps {
  id_caja: number;
  fecha: {
    apertura: string;
    cierre: string;
  };
  hora: {
    apertura: string;
    cierre: string;
  };
  observaciones: string;
  monto_sistema: number;
  monto_real: number;
  monto_faltante: number;
}

interface DetalleCajasProps {
  props: DetalleProps[];
  onAbrirLibroDiario: () => void; // Función global que recibe el id
}

export const DetalleCajas = ({
  props,
  onAbrirLibroDiario,
}: DetalleCajasProps) => {
  if (!props || props.length === 0) {
    return (
      <div className="detalle_caja_vacio">
        <p>No hay cajas registradas.</p>
      </div>
    );
  }

  return (
    <div className="detalle_caja_marco">
      <div className="detalle_caja_titulo">
        <Wallet size={14} />
        <span>Histórico de cajas cerradas</span>
      </div>

      <div className="detalle_caja_lista">
        {props.map((detalle) => {
          const esFaltante = detalle.monto_faltante < 0;

          return (
            <article
              key={detalle.id_caja}
              className={`detalle_caja_card ${esFaltante ? "faltante" : "ok"}`}
            >
              <header className="detalle_caja_cabecera">
                <div className="detalle_caja_fechas">
                  <span className="detalle_caja_rango">
                    <Calendar size={13} />
                    {detalle?.fecha?.apertura ?? "-"} →{" "}
                    {detalle?.fecha?.cierre ?? "-"}
                  </span>
                  <span className="detalle_caja_horas">
                    <Clock size={12} />
                    {detalle?.hora?.apertura ?? "-"} —{" "}
                    {detalle?.hora?.cierre ?? "-"}
                  </span>
                </div>

                <div
                  className={`detalle_caja_sello ${esFaltante ? "sello_rojo" : "sello_verde"}`}
                >
                  {esFaltante ? "Faltante" : "Caja OK"}
                </div>
              </header>

              <div className="detalle_caja_montos">
                <div className="monto_item">
                  <span className="monto_label">Sistema</span>
                  <span className="monto_valor">
                    ${detalle.monto_sistema.toLocaleString("es-AR")}
                  </span>
                </div>

                <div className="monto_item">
                  <span className="monto_label">Real</span>
                  <span className="monto_valor">
                    ${detalle.monto_real.toLocaleString("es-AR")}
                  </span>
                </div>

                <div className="monto_item">
                  <span className="monto_label">
                    {esFaltante ? "Faltante" : "Diferencia"}
                  </span>
                  <span
                    className={`monto_valor ${esFaltante ? "monto_negativo" : "monto_positivo"}`}
                  >
                    {esFaltante
                      ? `-$${Math.abs(detalle.monto_faltante).toLocaleString("es-AR")}`
                      : "$0"}
                  </span>
                </div>
              </div>

              {detalle.observaciones && (
                <div className="detalle_caja_obs">
                  <MessageSquare size={13} />
                  <p>{detalle.observaciones}</p>
                </div>
              )}

              <Boton
                clase="flechas"
                texto="Ver detalle de arqueo"
                logo="Go"
                disable={false}
                onClick={onAbrirLibroDiario}
              />
            </article>
          );
        })}
      </div>
    </div>
  );
};
