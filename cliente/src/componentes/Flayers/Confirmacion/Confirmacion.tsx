import { LuCheck } from "react-icons/lu";

import "./modalconfirmacion.css";

interface ModalConfirmacionProps {
  abierto: boolean;
  onCerrar?: () => void;
  titulo?: string;
  mensaje?: string;
}

export const ModalConfirmacion = ({
  abierto,
  onCerrar,
  titulo = "¡Flyer subido con éxito!",
  mensaje = "El material promocional ya está disponible para la academia.",
}: ModalConfirmacionProps) => {
  if (!abierto) return null;

  return (
    <div className="modal_overlay" onClick={onCerrar}>
      <div
        className="modal_card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal_icono">
          <LuCheck size={26} />
        </div>

        <h3 className="modal_titulo">{titulo}</h3>
        <p className="modal_mensaje">{mensaje}</p>

        <button className="modal_btn_cerrar" onClick={onCerrar}>
          Aceptar
        </button>
      </div>
    </div>
  );
};
