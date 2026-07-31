import { Boton } from "../Boton/Boton";
import "./compo.verificacion.css";

interface PropsVerificacion {
  texto: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  enviando: boolean;
}

export const CompoVerificacion = (props: PropsVerificacion) => {
  return (
    <div className="contenedor_verificacion">
      <p>Estas seguro de {props.texto}</p>
      <div className="contenedor_verificacion_botones">
        <Boton
          clase="aceptar"
          texto="SI"
          onClick={props.onConfirmar}
          disable={props.enviando}
        />
        <Boton clase="cancelar" texto="NO" onClick={props.onCancelar} />
      </div>
    </div>
  );
};
