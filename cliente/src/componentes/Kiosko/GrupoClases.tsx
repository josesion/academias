import { CalendarClock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ClaseInfo } from "../../pagina/privado/FormularioAsistencia/FormularioAsistencia";
import { TarjetaClase } from "./TarjetaClase";

/**
 * Grupo de tarjetas para una sección (En curso / Próxima).
 * Muestra una tarjeta por clase, o un mensaje vacío si no hay clases.
 */
type GrupoClasesProps = {
	variante: "actual" | "proxima";
	etiqueta: string;
	Icono: LucideIcon;
	clases: ClaseInfo[];
	textoVacio: string;
};

export const GrupoClases = ({
	variante,
	etiqueta,
	Icono,
	clases,
	textoVacio,
}: GrupoClasesProps) => {
	if (clases.length === 0) {
		return (
			<article className={`clase_card card-base ${variante} clase_card--vacia`}>
				<span className={`badge ${variante}`}>
					<Icono size={13} aria-hidden="true" />
					{etiqueta}
				</span>
				<div className="clase_contenido">
					<h2>{textoVacio}</h2>
					<p>
						<CalendarClock size={16} aria-hidden="true" />
						<span>00:00</span>
						<span className="separador_hora" aria-hidden="true">
							→
						</span>
						<span>00:00</span>
					</p>
				</div>
			</article>
		);
	}

	return (
		<div className="grupo_clases">
			{clases.map((clase, idx) => (
				<TarjetaClase
					key={`${variante}-${idx}`}
					variante={variante}
					etiqueta={etiqueta}
					Icono={Icono}
					clase={clase}
				/>
			))}
		</div>
	);
};
