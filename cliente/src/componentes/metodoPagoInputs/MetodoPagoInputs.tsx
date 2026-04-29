import { Inputs } from "../Inputs/Inputs";

import "./metodopagointputs.css";

interface MetodosPago {
  id_cuenta: number | string;
  nombre_cuenta: string;
  tipo_cuenta: string;
  monto_sistema: number;
  monto_real: number;
}

interface PropsInputs {
  listadoMetodoPago?: MetodosPago[];
}

const mockCuentas: MetodosPago[] = [
  {
    id_cuenta: 1,
    nombre_cuenta: "Efectivo",
    tipo_cuenta: "fisico",
    monto_sistema: 13000.0, // Lo que el software dice que hay
    monto_real: 12800.0, // Lo que vos vas a escribir en el input
  },
  {
    id_cuenta: 2,
    nombre_cuenta: "Mercado Pago",
    tipo_cuenta: "virtual",
    monto_sistema: 10000.0,
    monto_real: 10000.0,
  },
];

export const MetodosPagoInputs = (props: PropsInputs) => {
  return (
    <div className="contenedor_metodo_pago_inputs">
      {/* Encabezado de la "tabla" */}
      <div className="header_arqueo_grid">
        <span>Cuenta</span>
        <span>Sistema</span>
        <span>Tu Conteo</span>
        <span>Diferencia</span>
      </div>

      {mockCuentas.map((item) => {
        const diferencia = item.monto_real - item.monto_sistema;

        return (
          <div key={item.id_cuenta} className="fila_metodo_pago">
            {/* 1. Identificación de Cuenta */}
            <div className="columna_nombre">
              <span className="icon_tipo">
                {item.tipo_cuenta === "fisico" ? "💵" : "💳"}
              </span>
              <p>{item.nombre_cuenta}</p>
            </div>

            {/* 2. Valor del Sistema (Usamos tu Input como readonly) */}
            <div className="columna_sistema">
              <Inputs
                label="" // Sin label para que no ocupe espacio extra en la fila
                type="text"
                readonly={true}
                value={`$ ${item.monto_sistema.toLocaleString()}`}
                placeholder=""
              />
            </div>

            {/* 3. Tu Conteo (Input Editable) */}
            <div className="columna_input">
              <Inputs
                label=""
                type="number"
                readonly={false}
                value={item.monto_real}
                placeholder="0.00"
                name={`conteo_${item.id_cuenta}`}
                // onChange se conectará luego al estado global del cierre
              />
            </div>

            {/* 4. Visualización de Diferencia */}
            <div className="columna_diferencia">
              <span
                className={`badge_dif ${diferencia < 0 ? "negativo" : diferencia > 0 ? "positivo" : "ok"}`}
              >
                {diferencia === 0 ? "OK" : `$ ${diferencia.toLocaleString()}`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
