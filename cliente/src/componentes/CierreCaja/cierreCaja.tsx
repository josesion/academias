import { TarjetasNormales } from "../TarjetasNormales/TarjetaNormali";
import { MetodosPagoInputs } from "../metodoPagoInputs/MetodoPagoInputs";
//---- logica de negocio ----//
import { cajasCongif } from "../../hookNegocios/caja.usuario";

import "./cierrecaja.css";

export const CierreCaja = () => {
  const { panelPrincial, metricasTipoCuentas } = cajasCongif();

  console.log(metricasTipoCuentas);

  return (
    <div className="coontenedor_cierre_caja">
      <h2>RESUMEN Y ARQUEO FINAL DE CAJA</h2>
      <div className="contenedor_resumen_general">
        <p>resumen general</p>

        <TarjetasNormales
          titulo="Monto Inicial"
          monto={panelPrincial?.[0]?.monto_inicial ?? 0}
          claseColor="azul"
        />

        <TarjetasNormales
          titulo="Ingresos (+)"
          monto={panelPrincial?.[0]?.total_ingresos || 0}
          claseColor="verde"
        />

        <TarjetasNormales
          titulo="Egresos (-)"
          monto={panelPrincial?.[0]?.total_egresos || 0}
          claseColor="rojo"
        />

        <TarjetasNormales
          titulo="Balance Neto"
          monto={panelPrincial?.[0]?.balance_neto || 0}
          claseColor="negro"
        />
      </div>

      <div className="contenedor_detalle_cierre_caja">
        <MetodosPagoInputs />
      </div>

      <div className="contenedor_resultado_cierre_caja">
        <p>| **DIFERENCIA TOTAL CONSOLIDADA: -$200**</p>
      </div>

      <div className="contenedor_justificacion_cierre_caja">
        <label htmlFor="observaciones_cierre">
          JUSTIFICACIÓN{" "}
          <span className="requerido">(Obligatorio si existe diferencia)</span>
        </label>
        <textarea
          id="observaciones_cierre"
          name="observaciones_cierre"
          className="textarea_cyber"
          placeholder="Ej: Faltan $200 por compra de insumos de limpieza no registrados..."
          rows={4}
        ></textarea>
      </div>

      <div className="contenedor_botonera_cierre_caja">
        <p>boton cierre</p> <p>boton cerrar modal</p>
      </div>
    </div>
  );
};
