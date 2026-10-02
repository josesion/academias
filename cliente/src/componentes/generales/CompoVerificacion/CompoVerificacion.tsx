import { Boton } from "../Boton/Boton";
import "./compo.verificacion.css";

interface PropsVerificacion {
  texto: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  enviando: boolean;
  modal?: boolean;
}

export const CompoVerificacion = (props: PropsVerificacion) => {
  const { modal = false } = props;

  const contenido = (
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

  if (modal) {
    return (
      <div className="modal_verificacion_overlay" onClick={props.onCancelar}>
        <div
          className="modal_verificacion_contenedor"
          onClick={(e) => e.stopPropagation()}
        >
          {contenido}
        </div>
      </div>
    );
  }

  return contenido;
};
