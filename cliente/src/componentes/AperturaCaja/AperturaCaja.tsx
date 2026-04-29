import { useRef, useEffect } from "react";
import { Boton } from "../Boton/Boton";
import { Inputs } from "../Inputs/Inputs";
import { CompoError } from "../Error/Error";
import { FcDebt } from "react-icons/fc";
import "./aperturacaja.css";

interface DetalleApertura {
  id_cuenta: number;
  nombre_cuenta: string;
  monto: number;
}
// Importamos o definimos la interfaz del detalle aquí también
import { type ListadoTipoCuentas } from "../../tipadosTs/caja.typado";

interface AbrirCajaProps {
  onAbrirCaja: () => void;
  onCancelar: () => void;
  // Cambiamos la prop para que reciba la función dinámica con los 3 parámetros
  onChangeMontoDinamico: (
    id_cuenta: number,
    nombre: string,
    valor: string,
  ) => void;
  enviado: boolean;
  errorGenerico: string | null;
  listadoCuentasActivas: ListadoTipoCuentas[];
  // Ahora es un Array, no un Record
  aperturaDetalle: DetalleApertura[];
}

export const AperturaCaja = (props: AbrirCajaProps) => {
  const montoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (montoInputRef.current) {
      montoInputRef.current.focus();
    }
  }, [props.listadoCuentasActivas]);

  return (
    <div className="apertura-caja-container">
      <p className="titulo-apertura">
        Apertura Caja <FcDebt />
      </p>

      <div className="apertura_tipos_cuentas">
        {props.listadoCuentasActivas.map(
          (item: ListadoTipoCuentas, index: number) => {
            // Buscamos el objeto correspondiente en el array de detalles
            const detalleActual = props.aperturaDetalle.find(
              (d) => d.id_cuenta === item.id_cuenta,
            );

            return (
              <div key={item.id_cuenta} className="contenedor_input_cuenta">
                <p>
                  <strong>{item.nombre_cuenta}</strong> ({item.tipo_cuenta})
                </p>
                <Inputs
                  name={item.id_cuenta.toString()}
                  placeholder="0.00"
                  label="Monto Inicial"
                  type="text"
                  // Si existe en el array mostramos el monto, si no, vacío
                  value={detalleActual ? detalleActual.monto : ""}
                  onChange={(e: any) =>
                    props.onChangeMontoDinamico(
                      item.id_cuenta,
                      item.nombre_cuenta,
                      e.target.value,
                    )
                  }
                  readonly={false}
                  // Hacemos focus solo al primero
                  ref={index === 0 ? montoInputRef : null}
                />
              </div>
            );
          },
        )}
      </div>

      <div className="acciones-apertura">
        <Boton
          texto="Abrir Caja"
          logo="Go"
          clase="agregar"
          disable={props.enviado}
          onClick={props.onAbrirCaja}
        />
        <Boton
          texto="Cancelar"
          logo="Cancel"
          clase="cancelar"
          onClick={props.onCancelar}
        />
      </div>

      {props.errorGenerico && <CompoError mensaje={props.errorGenerico} />}
    </div>
  );
};
