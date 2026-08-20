import { Boton } from "../../generales/Boton/Boton";
import { Calendar, Clock, Wallet, MessageSquare } from "lucide-react";
import { ComponenteCargando } from "../../generales/Cargando/Cargando";

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
  observaciones: string | null;
  monto_sistema: number;
  monto_real: number;
  monto_faltante: number;
}

interface DetalleCajasProps {
  carga: boolean;
  props: DetalleProps[];
  onAbrirLibroDiario: (idCaja: number) => void;
}

// tres estados posibles, no dos — faltante, sobrante y exacta se
// tratan cada uno como algo distinto, no "ok" vs "no ok"
type EstadoArqueo = "faltante" | "sobrante" | "exacta";

const calcularEstado = (montoFaltante: number): EstadoArqueo => {
  if (montoFaltante < 0) return "faltante";
  if (montoFaltante > 0) return "sobrante";
  return "exacta";
};

const TEXTO_SELLO: Record<EstadoArqueo, string> = {
  faltante: "Faltante",
  sobrante: "Sobrante",
  exacta: "Caja OK",
};

const TEXTO_LABEL_DIFERENCIA: Record<EstadoArqueo, string> = {
  faltante: "Faltante",
  sobrante: "Sobrante",
  exacta: "Diferencia",
};

export const DetalleCajas = ({
  carga,
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

      {carga ? (
        <ComponenteCargando />
      ) : (
        <div className="detalle_caja_lista">
          {props.map((detalle) => {
            const estado = calcularEstado(detalle.monto_faltante);

            return (
              <article
                key={detalle.id_caja}
                className={`detalle_caja_card ${estado}`}
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

                  <div className={`detalle_caja_sello sello_${estado}`}>
                    {TEXTO_SELLO[estado]}
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
                      {TEXTO_LABEL_DIFERENCIA[estado]}
                    </span>
                    <span className={`monto_valor monto_${estado}`}>
                      {estado === "exacta"
                        ? "$0"
                        : `${estado === "sobrante" ? "+" : "-"}$${Math.abs(
                            detalle.monto_faltante,
                          ).toLocaleString("es-AR")}`}
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
                  onClick={() => {
                    onAbrirLibroDiario(detalle.id_caja);
                    console.log(detalle.id_caja);
                  }}
                />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
