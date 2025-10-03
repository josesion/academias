
//Seccion de stilo
import "./error.css";
//Seccion de tipado
type CompoErrorProps = {
    mensaje: string;
};


export const CompoError = ({ mensaje }: CompoErrorProps) => {
    return (
        <div className="error-contenedor">
            <p className="error-mensaje">{mensaje}</p>
        </div>
    );
};
