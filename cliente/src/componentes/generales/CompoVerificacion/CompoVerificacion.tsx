import { Boton } from "../Boton/Boton";
import { useModalAccesible } from "../../../hooks/useModalAccesible";
import "./compo.verificacion.css";

interface PropsVerificacion {
  texto: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  enviando: boolean;
  modal?: boolean;
}

/**
 * Confirmación "¿estás seguro…?" reutilizada por varias pantallas.
 *
 * En modo `modal` es un diálogo de verdad: Escape cierra, el foco entra y
 * queda atrapado, y vuelve al botón que lo abrió (spec 014). Fuera del modo
 * modal es un bloque normal y no lleva `role`.
 *
 * @param props.texto - Qué se va a confirmar (va en el texto).
 * @param props.onConfirmar - Confirma la acción.
 * @param props.onCancelar - Cancela y cierra.
 * @param props.enviando - Estado de carga: deshabilita los botones.
 * @param props.modal - Si se muestra como diálogo.
 */
export const CompoVerificacion = (props: PropsVerificacion) => {
  const { modal = false } = props;

  const { refDialog } = useModalAccesible({
    abierto: modal,
    onCerrar: props.onCancelar,
  });

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
          ref={refDialog}
          className="modal_verificacion_contenedor"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar acción"
        >
          {contenido}
        </div>
      </div>
    );
  }

  return contenido;
};
