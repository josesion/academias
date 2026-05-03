import { TarjetasNormales } from "../TarjetasNormales/TarjetaNormali";
import { MetodosPagoInputs } from "../metodoPagoInputs/MetodoPagoInputs";
import { Boton } from "../Boton/Boton";

//---- logica de negocio ----//
import { cajasCongif } from "../../hookNegocios/caja.usuario";

import "./cierrecaja.css";

interface PropsCierreCaja {
  onCerrar?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onCancelar?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const CierreCaja = (data: PropsCierreCaja) => {
  const {
    panelPrincial,
    metricasCuentasCierre,
    handleCierreMontos,
    montoRealFinal,
  } = cajasCongif();

  console.log(montoRealFinal === panelPrincial?.[0]?.balance_neto);
  console.log(montoRealFinal);
  console.log(panelPrincial?.[0]?.balance_neto);
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
        <MetodosPagoInputs
          listadoMetodoPago={metricasCuentasCierre}
          onChangeMontos={handleCierreMontos}
        />
      </div>

      <div className="contenedor_resultado_cierre_caja">
        <p
          className={
            // Si todavía no cargó nada (es 0), usamos una clase neutra
            montoRealFinal === 0
              ? "badge_dif pendiente"
              : montoRealFinal === panelPrincial?.[0]?.balance_neto
                ? "badge_dif ok"
                : montoRealFinal < (panelPrincial?.[0]?.balance_neto ?? 0)
                  ? "badge_dif negativo"
                  : "badge_dif positivo"
          }
        >
          {montoRealFinal === 0
            ? "ESPERANDO INGRESO DE MONTOS..."
            : montoRealFinal === panelPrincial?.[0]?.balance_neto
              ? `CAJA PERFECTA: ${montoRealFinal}`
              : montoRealFinal < (panelPrincial?.[0]?.balance_neto ?? 0)
                ? `FALTANTE EN CAJA: ${montoRealFinal - (panelPrincial?.[0]?.balance_neto ?? 0)}`
                : `SOBRANTE EN CAJA: ${montoRealFinal - (panelPrincial?.[0]?.balance_neto ?? 0)}`}
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
          disabled={montoRealFinal === panelPrincial?.[0]?.balance_neto}
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
