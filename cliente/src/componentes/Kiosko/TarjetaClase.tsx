import { CalendarClock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ClaseInfo } from "../../pagina/privado/FormularioAsistencia/FormularioAsistencia";

/**
 * Tarjeta individual de clase (en curso o próxima).
 * Muestra nombre, sala, horario y etiqueta con ícono.
 */
type TarjetaClaseProps = {
	variante: "actual" | "proxima";
	etiqueta: string;
	Icono: LucideIcon;
	clase: ClaseInfo | null;
};

export const TarjetaClase = ({
	variante,
	etiqueta,
	Icono,
	clase,
}: TarjetaClaseProps) => {
	if (!clase) return null;

	return (
		<article className={`clase_card card-base ${variante}`}>
			<span className={`badge ${variante}`}>
				<Icono size={13} aria-hidden="true" />
				{etiqueta}
			</span>

			<div className="clase_contenido">
				<h2>{clase.nombre_clase}</h2>
				{clase.sala && <p className="clase_sala">{clase.sala}</p>}

				<p>
					<CalendarClock size={16} aria-hidden="true" />
					<span>{clase.hora_inicio}</span>
					<span className="separador_hora" aria-hidden="true">
						→
					</span>
					<span>{clase.hora_fin}</span>
				</p>
			</div>
		</article>
	);
};
