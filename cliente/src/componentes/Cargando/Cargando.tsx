
import "./cargando.css"

export const ComponenteCargando = () => {
    return (
        <div className="overlay_cargando">
            <div className="cartel_cargando">
                <div className="spinner"></div>
                <p className="texto_cargando">Cargando...</p>
            </div>
        </div>
    );
};
