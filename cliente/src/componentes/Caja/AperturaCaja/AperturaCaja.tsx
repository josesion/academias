import { useRef, useEffect } from "react";
import { Boton } from "../../generales/Boton/Boton";
import { Inputs } from "../../generales/Inputs/Inputs";
import { CompoError } from "../../generales/Error/Error";
import { Wallet, Landmark } from "lucide-react";
import { type ListadoTipoCuentas } from "../../../tipadosTs/caja.typado";

import "./aperturacaja.css";

interface DetalleApertura {
  id_cuenta: number;
  nombre_cuenta: string;
  monto: number | string;
}

interface AbrirCajaProps {
  onAbrirCaja: () => void;
  onCancelar: () => void;
  onChangeMontoDinamico: (
    id_cuenta: number,
    nombre: string,
    valor: string,
  ) => void;
  enviado: boolean;
  errorGenerico: string | null;
  listadoCuentasActivas: ListadoTipoCuentas[];
  aperturaDetalle: DetalleApertura[] | null;
}

export const AperturaCaja = (props: AbrirCajaProps) => {
  const montoInputRef = useRef<HTMLInputElement>(null);
  const focoInicializado = useRef(false);

  /**
   * Enfoca el primer input solo una vez cuando el modal aparece por primera vez.
   *
   * Antes el `useEffect` dependía de `props.listadoCuentasActivas`: cada
   * dispatch del reducer (por ejemplo, al tipear un monto) provocaba un
   * re-render y, si la referencia del array cambiaba, el efecto volvía a
   * ejecutar `montoInputRef.current.focus()`, robando el foco del campo donde
   * el usuario estaba trabajando. El resultado era que al tabular a otro input
   * —o al intentar hacer clic en "Abrir Caja" / "Cancelar"— el foco volvía
   * inmediatamente al primer campo y la UI parecía congelada.
   *
   * Con el guard `focoInicializado` el foco se establece una única vez
   * (cuando el modal se abre) y ya no interfiere con la navegación del usuario.
   */
  useEffect(() => {
    if (!focoInicializado.current && montoInputRef.current) {
      montoInputRef.current.focus();
      focoInicializado.current = true;
    }
  }, [props.listadoCuentasActivas]);

  return (
    <div className="coontenedor_apertura_caja">
      {/* TÍTULO */}
      <div className="apertura_titulo">
        <h2>Apertura de Caja</h2>
        <span>
          Ingrese el saldo inicial con el que cuenta cada método de pago.
        </span>
      </div>

      {/* TARJETA / GRILLA DE CUENTAS */}
      <div className="card_cierre">
        <div className="card_titulo">Cuentas Habilitadas</div>

        <div className="grid_apertura_cuentas">
          {props.listadoCuentasActivas.map(
            (item: ListadoTipoCuentas, index: number) => {
              const detalleActual = props.aperturaDetalle?.find(
                (d) => d.id_cuenta === item.id_cuenta,
              );
              const esFisico = item.tipo_cuenta === "fisico";

              return (
                <div key={item.id_cuenta} className="tarjeta_metodo_pago">
                  <div className="metodo_header">
                    <div className="metodo_info_principal">
                      <div
                        className={`metodo_icono ${esFisico ? "fisico" : "virtual"}`}
                      >
                        {esFisico ? (
                          <Landmark size={16} />
                        ) : (
                          <Wallet size={16} />
                        )}
                      </div>
                      <div>
                        <h4>{item.nombre_cuenta}</h4>
                        <span>
                          {esFisico ? "Efectivo / Caja" : "Digital / Banco"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="metodo_cuerpo_apertura">
                    <div className="metodo_campo">
                      <span className="dato_label">Monto Inicial</span>
                      <Inputs
                        name={item.id_cuenta.toString()}
                        placeholder="0.00"
                        label=""
                        type="number"
                        value={detalleActual ? detalleActual.monto : ""}
                        onChange={(e: any) =>
                          props.onChangeMontoDinamico(
                            item.id_cuenta,
                            item.nombre_cuenta,
                            e.target.value,
                          )
                        }
                        readonly={false}
                        ref={index === 0 ? montoInputRef : null}
                      />
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* ERROR SI LO HAY */}
      {props.errorGenerico && <CompoError mensaje={props.errorGenerico} />}

      {/* ACCIONES / BOTONERA */}
      <div className="contenedor_botonera_apertura">
        <Boton
          texto="Abrir Caja"
          logo="Go"
          clase="agregar"
          disable={props.enviado}
          type="button"
          onClick={props.onAbrirCaja}
        />
        <Boton
          texto="Cancelar"
          logo="Cancel"
          clase="cancelar"
          type="button"
          onClick={props.onCancelar}
        />
      </div>
    </div>
  );
};
