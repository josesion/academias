import { TarjetasNormales } from "../TarjetasNormales/TarjetaNormali";
import { MetodosPagoInputs } from "../metodoPagoInputs/MetodoPagoInputs";
import { Boton } from "../Boton/Boton";

//---- logica de negocio ----//

import type { MetodosPago } from "../metodoPagoInputs/MetodoPagoInputs";
import type { MetricasCajaPanelPrincipal } from "../../tipadosTs/caja.typado";

import "./cierrecaja.css";

interface PropsCierreCaja {
  metricas: MetodosPago[] | null;
  metricasPanel?: MetricasCajaPanelPrincipal[] | null;
  montoRealFinal: number;
  onCambioObservaciones: (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  onCambioMontos: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCerrar?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onCancelar?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const CierreCaja = (data: PropsCierreCaja) => {
  return (
    <div className="coontenedor_cierre_caja">
      <h2>RESUMEN Y ARQUEO FINAL DE CAJA</h2>
      <div className="contenedor_resumen_general">
        <p>resumen general</p>

        <TarjetasNormales
          titulo="Monto Inicial"
          monto={data.metricasPanel?.[0]?.monto_inicial ?? 0}
          claseColor="azul"
        />

        <TarjetasNormales
          titulo="Ingresos (+)"
          monto={data.metricasPanel?.[0]?.total_ingresos || 0}
          claseColor="verde"
        />

        <TarjetasNormales
          titulo="Egresos (-)"
          monto={data.metricasPanel?.[0]?.total_egresos || 0}
          claseColor="rojo"
        />

        <TarjetasNormales
          titulo="Balance Neto"
          monto={data.metricasPanel?.[0]?.balance_neto || 0}
          claseColor="negro"
        />
      </div>

      <div className="contenedor_detalle_cierre_caja">
        <MetodosPagoInputs
          listadoMetodoPago={data.metricas}
          onChangeMontos={data.onCambioMontos}
        />
      </div>

      <div className="contenedor_resultado_cierre_caja">
        <p
          className={
            // Si todavía no cargó nada (es 0), usamos una clase neutra
            data.montoRealFinal === 0
              ? "badge_dif pendiente"
              : data.montoRealFinal === data.metricasPanel?.[0]?.balance_neto
                ? "badge_dif ok"
                : data.montoRealFinal <
                    (data.metricasPanel?.[0]?.balance_neto ?? 0)
                  ? "badge_dif negativo"
                  : "badge_dif positivo"
          }
        >
          {data.montoRealFinal === 0
            ? "ESPERANDO INGRESO DE MONTOS..."
            : data.montoRealFinal === data.metricasPanel?.[0]?.balance_neto
              ? `CAJA PERFECTA: ${data.montoRealFinal}`
              : data.montoRealFinal <
                  (data.metricasPanel?.[0]?.balance_neto ?? 0)
                ? `FALTANTE EN CAJA: ${data.montoRealFinal - (data.metricasPanel?.[0]?.balance_neto ?? 0)}`
                : `SOBRANTE EN CAJA: ${data.montoRealFinal - (data.metricasPanel?.[0]?.balance_neto ?? 0)}`}
        </p>
      </div>

      <div className="contenedor_justificacion_cierre_caja">
        <label htmlFor="observaciones_cierre">
          JUSTIFICACIÓN{" "}
          <span className="requerido">
            {/* Solo pedimos justificación si ya cargó algo Y hay diferencia */}
            (Obligatorio si existe diferencia)
          </span>
        </label>
        <textarea
          id="observaciones_cierre"
          name="observaciones_cierre"
          className="textarea_cyber"
          placeholder="Ej: Faltan $200 por compra de insumos..."
          rows={4}
          /* El textarea se habilita solo si ya cargó montos Y la caja NO es perfecta */
          disabled={
            data.montoRealFinal === data.metricasPanel?.[0]?.balance_neto
          }
          onChange={data.onCambioObservaciones}
        ></textarea>
      </div>

      <div className="contenedor_botonera_cierre_caja">
        <Boton
          clase="aceptar"
          logo="Add"
          texto="Cerrar caja"
          onClick={data.onCancelar}
        />
        <Boton
          clase="cancelar"
          logo="Cancel"
          texto="Cancelar"
          onClick={data.onCerrar}
        />
      </div>
    </div>
  );
};
