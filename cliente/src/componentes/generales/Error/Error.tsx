import "./error.css";
import { BiSolidErrorCircle } from "react-icons/bi";

type CompoErrorProps = {
  mensaje: string;
};

export const CompoError = ({ mensaje }: CompoErrorProps) => {
  return (
    // `role="alert"` para que el lector de voz anuncie el error apenas aparece
    // (spec 016): el aviso es puramente visual y antes no se notificaba.
    <div className="error-contenedor" role="alert">
      <div className="escena-radar-icono" aria-hidden="true">
        {/* Los anillos del radar que se expanden */}
        <div className="radar-anillo_error"></div>
        <div className="radar-anillo_error lento"></div>

        <BiSolidErrorCircle className="error-icono" />
      </div>

      <p className="error-mensaje">{mensaje}</p>
    </div>
  );
};
