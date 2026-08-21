import React from "react";
import { Inputs } from "../../generales/Inputs/Inputs";
import { Wallet, Landmark, ArrowUpRight } from "lucide-react";

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

export const MetodosPagoInputs: React.FC<PropsInputs> = (props) => {
  return (
    <div className="contenedor_metodo_pago_inputs">
      <div className="metodo_pago_titulo">
        <span>Desglose de cuentas físicas y virtuales para el arqueo</span>
      </div>

      <div className="grid_metodos_pago">
        {props.listadoMetodoPago?.map((item) => {
          const diferencia =
            Number(item.monto_real) - Number(item.monto_sistema);
          const esFisico = item.tipo_cuenta === "fisico";

          return (
            <div key={item.id_cuenta} className="tarjeta_metodo_pago">
              {/* CABECERA DE LA TARJETA */}
              <div className="metodo_header">
                <div className="metodo_info_principal">
                  <div
                    className={`metodo_icono ${esFisico ? "fisico" : "virtual"}`}
                  >
                    {esFisico ? <Landmark size={16} /> : <Wallet size={16} />}
                  </div>
                  <div>
                    <h4>{item.nombre_cuenta}</h4>
                    <span>
                      {esFisico ? "Efectivo / Caja" : "Digital / Banco"}
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
                    ? "EXACTO"
                    : `${diferencia > 0 ? "+" : ""}$${diferencia.toLocaleString(
                        "es-AR",
                        {
                          minimumFractionDigits: 2,
                        },
                      )}`}
                </div>
              </div>

              {/* CUERPO CON LOS INPUTS */}
              <div className="metodo_cuerpo">
                <div className="metodo_campo">
                  <span className="dato_label">Sistema</span>
                  <div className="monto_sistema_display">
                    $
                    {Number(item.monto_sistema).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <div className="metodo_campo">
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
    </div>
  );
};
