import { Inputs } from "../Inputs/Inputs";

import "./metodopagointputs.css";

export interface MetodosPago {
  id_cuenta: number | string;
  nombre_cuenta: string;
  tipo_cuenta: string;
  monto_sistema: number;
  monto_real: number | string;
}

interface PropsInputs {
  listadoMetodoPago?: MetodosPago[] | null;
  onChangeMontos?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MetodosPagoInputs = (props: PropsInputs) => {
  return (
    <div className="contenedor_metodo_pago_inputs">
      <div className="metodo_pago_titulo">
        <h3>Arqueo por Método de Pago</h3>
        <span>Ingrese el dinero contado para cada cuenta.</span>
      </div>

      {/* Header solo escritorio */}

      <div className="header_arqueo_grid">
        <span>Cuenta</span>
        <span>Sistema</span>
        <span>Conteo Real</span>
        <span>Diferencia</span>
      </div>

      {props.listadoMetodoPago?.map((item) => {
        const diferencia = Number(item.monto_real) - item.monto_sistema;

        return (
          <div key={item.id_cuenta} className="fila_metodo_pago">
            {/* ===========================
                CABECERA
            =========================== */}

            <div className="fila_superior">
              <div className="columna_nombre">
                <div className="icon_tipo">
                  {item.tipo_cuenta === "fisico" ? "💵" : "💳"}
                </div>

                <div className="info_cuenta">
                  <h4>{item.nombre_cuenta}</h4>

                  <span>
                    {item.tipo_cuenta === "fisico"
                      ? "Cuenta física"
                      : "Cuenta virtual"}
                  </span>
                </div>
              </div>

              <div
                className={`badge_diferencia ${
                  diferencia < 0
                    ? "negativo"
                    : diferencia > 0
                      ? "positivo"
                      : "ok"
                }`}
              >
                {diferencia === 0
                  ? "✔ Correcto"
                  : `${diferencia > 0 ? "+" : ""}$ ${diferencia.toLocaleString("es-AR")}`}
              </div>
            </div>

            {/* ===========================
                CUERPO
            =========================== */}

            <div className="fila_datos">
              <div className="dato">
                <span className="dato_label">Sistema</span>

                <Inputs
                  label=""
                  type="text"
                  readonly={true}
                  value={`$ ${item.monto_sistema.toLocaleString("es-AR")}`}
                  placeholder=""
                />
              </div>

              <div className="dato">
                <span className="dato_label">Conteo Real</span>

                <Inputs
                  label=""
                  type="number"
                  readonly={false}
                  value={item.monto_real}
                  placeholder="0.00"
                  name={item.nombre_cuenta}
                  onChange={props.onChangeMontos}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
