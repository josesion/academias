
import "./cargando.css"

/**
 * @function ComponenteCargando
 * @description Componente de overlay que bloquea la pantalla y muestra un spinner
 * y el texto "Cargando..." para indicar al usuario que debe esperar.
 * * **Uso:** Se utiliza para proporcionar una experiencia visual de espera durante
 * operaciones largas, como el envío de formularios o la carga inicial de datos.
 * @returns {JSX.Element} El elemento JSX que representa el overlay de carga.
 */

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
