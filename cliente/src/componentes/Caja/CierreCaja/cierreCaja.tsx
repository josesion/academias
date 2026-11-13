import React from "react";
import { TarjetasNormales } from "../../generales/TarjetasNormales/TarjetaNormali";
import { MetodosPagoInputs } from "../metodoPagoInputs/MetodoPagoInputs";
import { Boton } from "../../generales/Boton/Boton";

import type { MetodosPago } from "../metodoPagoInputs/MetodoPagoInputs";
import type { MetricasCajaPanelPrincipal } from "../../../tipadosTs/caja.typado";

import "./cierrecaja.css";

interface PropsCierreCaja {
  metricas: MetodosPago[] | null;
  metricasPanel?: MetricasCajaPanelPrincipal[] | null;
  montoRealFinal: number;
  carga: boolean;
  onCambioObservaciones: (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  onCambioMontos: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCerrar?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onCancelar?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const CierreCaja = (data: PropsCierreCaja) => {
  const balanceNeto = data.metricasPanel?.[0]?.balance_neto ?? 0;
  const esCajaPerfecta = data.montoRealFinal === balanceNeto;
  const esPendiente = data.montoRealFinal === 0;

  return (
    <div className="coontenedor_cierre_caja">
      {/* =====================================================
          TITULO
      ===================================================== */}
      <div className="cierre_titulo">
        <h2>Resumen y Arqueo Final de Caja</h2>
        <span>Verifique los montos reales antes de confirmar el cierre.</span>
      </div>

      {/* =====================================================
          RESUMEN (¡Intacto tal como lo tenías!)
      ===================================================== */}
      <section className="card_cierre">
        <div className="card_titulo">Resumen General</div>

        <div className="contenedor_resumen_general">
          <TarjetasNormales
            titulo="Monto Inicial"
            monto={data.metricasPanel?.[0]?.monto_inicial ?? 0}
            claseColor="azul"
          />

          <TarjetasNormales
            titulo="Ingresos"
            monto={data.metricasPanel?.[0]?.total_ingresos || 0}
            claseColor="verde"
          />

          <TarjetasNormales
            titulo="Egresos"
            monto={data.metricasPanel?.[0]?.total_egresos || 0}
            claseColor="rojo"
          />

          <TarjetasNormales
            titulo="Balance Neto"
            monto={balanceNeto}
            claseColor="negro"
          />
        </div>
      </section>

      {/* =====================================================
          METODOS DE PAGO
      ===================================================== */}
      <section className="card_cierre">
        <div className="card_titulo">Arqueo por Métodos de Pago</div>

        <div className="contenedor_detalle_cierre_caja">
          <MetodosPagoInputs
            listadoMetodoPago={data.metricas}
            onChangeMontos={data.onCambioMontos}
          />
        </div>
      </section>

      {/* =====================================================
          RESULTADO Y JUSTIFICACIÓN (Unidos en un bloque dual)
      ===================================================== */}
      <div className="bloque_dual_resultado_justificacion">
        <section className="card_cierre seccion_resultado_dual">
          <div className="card_titulo">Resultado del Arqueo</div>

          <div className="contenedor_resultado_cierre_caja">
            <p
              className={
                esPendiente
                  ? "badge_dif pendiente"
                  : esCajaPerfecta
                    ? "badge_dif ok"
                    : data.montoRealFinal < balanceNeto
                      ? "badge_dif negativo"
                      : "badge_dif positivo"
              }
            >
              {esPendiente
                ? "ESPERANDO INGRESO DE MONTOS..."
                : esCajaPerfecta
                  ? `CAJA PERFECTA: $${data.montoRealFinal.toLocaleString("es-AR")}`
                  : data.montoRealFinal < balanceNeto
                    ? `FALTANTE EN CAJA: $${(data.montoRealFinal - balanceNeto).toLocaleString("es-AR")}`
                    : `SOBRANTE EN CAJA: $${(data.montoRealFinal - balanceNeto).toLocaleString("es-AR")}`}
            </p>
          </div>
        </section>

        <section className="card_cierre seccion_justificacion_dual">
          <div className="card_titulo">Justificación</div>

          <p className="texto_ayuda">Obligatoria si hay diferencia.</p>

          <textarea
            id="observaciones_cierre"
            name="observaciones_cierre"
            className="textarea_cyber"
            placeholder="Ej: Faltan $200 por compra de insumos..."
            rows={2}
            disabled={esCajaPerfecta}
            onChange={data.onCambioObservaciones}
          />
        </section>
      </div>

      {/* =====================================================
          BOTONERA
      ===================================================== */}
      <div className="contenedor_botonera_cierre_caja">
        <Boton
          disable={data.carga}
          clase="aceptar"
          logo="Add"
          texto="Cerrar Caja"
          onClick={data.onCerrar}
        />

        <Boton
          clase="cancelar"
          logo="Cancel"
          texto="Cancelar"
          onClick={data.onCancelar}
        />
      </div>
    </div>
  );
};
