import "./error.css";
import { BiSolidErrorCircle } from "react-icons/bi";

type CompoErrorProps = {
  mensaje: string;
};

export const CompoError = ({ mensaje }: CompoErrorProps) => {
  return (
    <div className="error-contenedor">
      <div className="escena-radar-icono">
        {/* Los anillos del radar que se expanden */}
        <div className="radar-anillo_error"></div>
        <div className="radar-anillo_error lento"></div>

        <BiSolidErrorCircle className="error-icono" />
      </div>

      <p className="error-mensaje">{mensaje}</p>
    </div>
  );
};
