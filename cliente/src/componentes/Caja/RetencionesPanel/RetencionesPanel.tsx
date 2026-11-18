import { ShieldAlert } from "lucide-react";

import { Inputs } from "../../generales/Inputs/Inputs";
import { Boton } from "../../generales/Boton/Boton";
import { CompoError } from "../../generales/Error/Error";

import type { RetencionActiva } from "../../../tipadosTs/caja.typado";

import "./retencionespanel.css";

interface PropsRetencionesPanel {
  retenciones: RetencionActiva[];
  retencionSeleccionada: number | null;
  devolucion: {
    monto: string;
    observacion: string;
  };
  carga: boolean;
  errorMensaje: string | null;
  onSeleccionar: (retencion: RetencionActiva) => void;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onDevolver: () => void;
  onJustificar: () => void;
}

/**
 * Panel lateral con las retenciones activas de la caja abierta (spec 050).
 *
 * Permite seleccionar una retención y resolverla: devolverla (total o
 * parcialmente) o justificarla como gasto real. Mientras exista al menos una
 * retención activa, la caja no se puede cerrar.
 *
 * @param {PropsRetencionesPanel} props - Retenciones, selección, formulario y callbacks.
 * @returns {JSX.Element} Panel de retenciones activas.
 */
export const RetencionesPanel = (props: PropsRetencionesPanel) => {
  return (
    <div className="panel_retenciones_contenedor">
      <div className="panel_retenciones_header">
        <ShieldAlert size={15} />
        <h3 className="panel_retenciones_titulo">Retenciones Activas</h3>
      </div>

      {props.retenciones.length === 0 ? (
        <div className="panel_retenciones_vacio">
          <span>Sin retenciones activas en esta sesión</span>
        </div>
      ) : (
        <div className="panel_retenciones_lista">
          {props.retenciones.map((retencion) => {
            const seleccionada =
              props.retencionSeleccionada === retencion.id_movimiento;

            return (
              <button
                key={retencion.id_movimiento}
                type="button"
                className={`retencion_item ${seleccionada ? "retencion_item_activa" : ""}`}
                onClick={() => props.onSeleccionar(retencion)}
                aria-pressed={seleccionada}
              >
                <div className="retencion_item_fila">
                  <span className="retencion_item_cuenta">
                    {retencion.nombre_cuenta}
                  </span>
                  <span className="retencion_item_monto">
                    $
                    {Number(retencion.monto).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="retencion_item_fila">
                  <span className="retencion_item_fecha">
                    {retencion.fecha_movimiento} · {retencion.hora_formateada}
                  </span>
                </div>
                {retencion.descripcion && (
                  <p className="retencion_item_descripcion">
                    {retencion.descripcion}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {props.retencionSeleccionada !== null && (
        <div className="panel_retenciones_form">
          <Inputs
            name="monto"
            label="Monto a devolver"
            placeholder="Monto devuelto"
            type="number"
            onChange={props.onChange}
            value={props.devolucion.monto}
            readonly={false}
          />

          <div className="memo_retencion_resolver">
            <label className="label_textarea">
              Observación (obligatoria si no se devuelve el total)
            </label>
            <textarea
              name="observacion"
              className="textarea_chulo"
              placeholder="Detalle de la devolución o justificación..."
              rows={3}
              onChange={props.onChange}
              value={props.devolucion.observacion}
            />
          </div>

          <div className="botonera_retencion_resolver">
            <Boton
              disable={props.carga}
              texto="Devolver"
              onClick={props.onDevolver}
              clase="aceptar"
              logo="Go"
            />
            <Boton
              disable={props.carga}
              texto="Justificar"
              onClick={props.onJustificar}
              clase="cancelar"
              logo="Check"
            />
          </div>

          {props.errorMensaje && <CompoError mensaje={props.errorMensaje} />}
        </div>
      )}
    </div>
  );
};
