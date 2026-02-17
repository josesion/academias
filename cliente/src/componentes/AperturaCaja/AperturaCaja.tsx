import { useRef, useEffect } from "react";

import { Boton } from "../Boton/Boton";
import { Inputs } from "../Inputs/Inputs";
import { CompoError } from "../Error/Error";
import { FcDebt } from "react-icons/fc";
import "./aperturacaja.css";

interface AbrirCajaProps {
  onAbrirCaja: () => void;
  onCancelar: () => void;
  onChangeMontoInicial: (e: React.ChangeEvent<HTMLInputElement>) => void;
  monto_inicial: string | number;
  enviado: boolean;
  errorGenerico: string | null;
}

export const AperturaCaja = (props: AbrirCajaProps) => {
  const montoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (montoInputRef.current) {
      montoInputRef.current.focus();
    }
  }, []);

  return (
    <div className="apertura-caja-container">
      <p className="titulo-apertura">
        Apertura Caja <FcDebt />
      </p>
      <Inputs
        name="monto_inicial"
        placeholder="ej : 500.00"
        label="Monto Inicial"
        type="number"
        value={props.monto_inicial}
        onChange={props.onChangeMontoInicial}
        readonly={false}
        ref={montoInputRef}
      />

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
