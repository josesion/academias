import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./CartelExitoRegistro.css";

interface CartelExitoRegistroProps {
  abierto: boolean;
}

export const CartelExitoRegistro = ({ abierto }: CartelExitoRegistroProps) => {
  const navegar = useNavigate();

  if (!abierto) return null;

  const irLogin = () => {
    navegar("/login");
  };

  return createPortal(
    <div className="cartel-exito-overlay">
      <div className="cartel-exito-tarjeta" role="dialog" aria-modal="true" aria-labelledby="titulo-exito-registro">
        <div className="cartel-exito-icono">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="cartel-exito-titulo" id="titulo-exito-registro">
          ¡Registro exitoso!
        </h2>
        <p className="cartel-exito-desc">
          Tu escuela y usuario fueron creados correctamente. Te enviamos por correo el usuario y la contraseña generada de 8 dígitos para que puedas ingresar.
        </p>
        <p className="cartel-exito-aviso">Revisá tu bandeja de entrada. Si no lo encontrás, chequeá la carpeta de spam o correo no deseado.</p>
        <button className="cartel-exito-btn" onClick={irLogin}>
          Ir al inicio de sesión
        </button>
      </div>
    </div>,
    document.body
  );
};
