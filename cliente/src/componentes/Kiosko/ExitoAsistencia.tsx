import { createPortal } from "react-dom";

import { LogoExito } from "../generales/CuadroExito/CuadroExito";

/**
 * Modal de éxito tras registrar asistencia.
 * Se renderiza como portal en document.body.
 */
export const ExitoAsistencia = () =>
	createPortal(
		<div className="overlay-exito">
			<div className="card-exito" role="status" aria-live="polite">
				<div className="card-exito_logo">
					<LogoExito />
				</div>

				<h2>¡Asistencia registrada!</h2>
				<p>Que disfrutes la clase.</p>
			</div>
		</div>,
		document.body,
	);
