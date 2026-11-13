import { Boton } from "../../generales/Boton/Boton";
import { Calendar, Clock, Wallet, MessageSquare, User, UserCheck } from "lucide-react";
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
  /** Nombre y apellido del usuario que abrió la caja (fallback: correo o "Sin usuario"). */
  usuario_apertura: string;
  /** Nombre y apellido del usuario que cerró la caja (fallback: correo o "Sin usuario"). */
  usuario_cierre: string;
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

/** Texto por defecto cuando el server no trae el usuario de la caja. */
const USUARIO_POR_DEFECTO = "Sin usuario";

/**
 * Devuelve el nombre del usuario de la caja con un texto legible (nunca vacío).
 *
 * @param {string | null | undefined} usuario - Nombre que trae el server.
 * @returns {string} El nombre del usuario o "Sin usuario" si no vino nada.
 */
const nombreUsuario = (usuario: string | null | undefined): string => {
  const texto = (usuario ?? "").trim();
  return texto !== "" ? texto : USUARIO_POR_DEFECTO;
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

  // Texto para aria-label del contenedor lista
  const labelLista = `Histórico de cajas cerradas (${props.length} cajas)`;

  return (
    <div className="detalle_caja_marco">
      <div className="detalle_caja_titulo">
        <Wallet size={14} />
        <span>Histórico de cajas cerradas</span>
      </div>

      {carga ? (
        <ComponenteCargando local />
      ) : (
        <div
          className="detalle_caja_lista"
          role="list"
          aria-label={labelLista}
        >
          {props.map((detalle) => {
            const estado = calcularEstado(detalle.monto_faltante);
            const idSello = `sello-${detalle.id_caja}`;
            const idMontos = `montos-${detalle.id_caja}`;
            const sistema = detalle.monto_sistema.toLocaleString("es-AR");
            const real = detalle.monto_real.toLocaleString("es-AR");
            const usuarioApertura = nombreUsuario(detalle.usuario_apertura);
            const usuarioCierre = nombreUsuario(detalle.usuario_cierre);
            const diferencia =
              estado === "exacta"
                ? "$0"
                : `${estado === "sobrante" ? "+" : "-"}$${Math.abs(
                    detalle.monto_faltante,
                  ).toLocaleString("es-AR")}`;

            return (
              <article
                key={detalle.id_caja}
                className={`detalle_caja_card ${estado}`}
                role="listitem"
                aria-labelledby={idSello}
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
                    id={idSello}
                    className={`detalle_caja_sello sello_${estado}`}
                    aria-live="polite"
                  >
                    {TEXTO_SELLO[estado]}
                  </div>
                </header>

                <div className="detalle_caja_montos">
                  <div className="monto_item">
                    <span className="monto_label">Sistema</span>
                    <span className="monto_valor">${sistema}</span>
                  </div>

                  <div className="monto_item">
                    <span className="monto_label">Real</span>
                    <span className="monto_valor">${real}</span>
                  </div>

                  <div className="monto_item">
                    <span className="monto_label">
                      {TEXTO_LABEL_DIFERENCIA[estado]}
                    </span>
                    <span className={`monto_valor monto_${estado}`}>
                      {diferencia}
                    </span>
                  </div>
                </div>

                {/* Quién abrió y quién cerró la caja (spec 042 · A3) */}
                <div className="detalle_caja_usuarios">
                  <span className="detalle_caja_usuario">
                    <User size={13} aria-hidden="true" />
                    <span className="detalle_caja_usuario_label">Abrió:</span>
                    <span className="detalle_caja_usuario_nombre">
                      {usuarioApertura}
                    </span>
                  </span>

                  <span className="detalle_caja_usuario">
                    <UserCheck size={13} aria-hidden="true" />
                    <span className="detalle_caja_usuario_label">Cerró:</span>
                    <span className="detalle_caja_usuario_nombre">
                      {usuarioCierre}
                    </span>
                  </span>
                </div>

                {/* Resumen para lectores de pantalla en el botón */}
                <div id={idMontos} className="visually-hidden">
                  Sistema: ${sistema}, Real: ${real}, Diferencia: ${diferencia}.
                  Abrió: {usuarioApertura}. Cerró: {usuarioCierre}.
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
                  aria-describedby={idMontos}
                  onClick={() => {
                    onAbrirLibroDiario(detalle.id_caja);
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
