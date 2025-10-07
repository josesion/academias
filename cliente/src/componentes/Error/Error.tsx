
//Seccion de stilo
import "./error.css";

//Seccion de tipado

/**
 * @typedef {Object} CompoErrorProps
 * @property {string} mensaje - El texto del error a mostrar al usuario.
 */
type CompoErrorProps = {
    mensaje: string;
};

/**
 * @function CompoError
 * @description Componente funcional que renderiza un mensaje de error dentro de un contenedor estilizado.
 * @param {CompoErrorProps} props - Las propiedades que incluyen el mensaje de error.
 * @returns {JSX.Element} El elemento JSX que muestra el mensaje de error.
 */

export const CompoError = ({ mensaje }: CompoErrorProps) => {
    return (
        <div className="error-contenedor">
            <p className="error-mensaje">{mensaje}</p>
        </div>
    );
};
