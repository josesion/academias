import { LuCheck } from "react-icons/lu";

import { useModalAccesible } from "../../../hooks/useModalAccesible";

import "./modalconfirmacion.css";

interface ModalConfirmacionProps {
  abierto: boolean;
  onCerrar?: () => void;
  titulo?: string;
  mensaje?: string;
}

/**
 * Confirmación de "flyer subido" (spec 014).
 *
 * `onCerrar` es opcional en la interfaz, pero para el teclado hace falta: si no
 * viniera, se pasa una función vacía (Escape no cerraría nada, que es el
 * comportamiento de siempre cuando no hay `onCerrar`).
 *
 * @param abierto - Si el modal se muestra.
 * @param onCerrar - Cierra el modal (click en el fondo, botón o Escape).
 * @param titulo - Título visible (anuncia el diálogo).
 * @param mensaje - Texto explicativo.
 */
export const ModalConfirmacion = ({
  abierto,
  onCerrar,
  titulo = "¡Flyer subido con éxito!",
  mensaje = "El material promocional ya está disponible para la academia.",
}: ModalConfirmacionProps) => {
  const { refDialog } = useModalAccesible({
    abierto,
    onCerrar: onCerrar ?? (() => {}),
  });

  if (!abierto) return null;

  return (
    <div className="modal_overlay" onClick={onCerrar}>
      <div
        ref={refDialog}
        className="modal_card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal_confirmacion_titulo"
      >
        <div className="modal_icono" aria-hidden="true">
          <LuCheck size={26} />
        </div>

        <h3 className="modal_titulo" id="modal_confirmacion_titulo">
          {titulo}
        </h3>
        <p className="modal_mensaje">{mensaje}</p>

        <button className="modal_btn_cerrar" onClick={onCerrar}>
          Aceptar
        </button>
      </div>
    </div>
  );
};
