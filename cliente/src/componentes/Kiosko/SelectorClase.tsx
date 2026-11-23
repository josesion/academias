import { DoorOpen } from "lucide-react";

import type { ClaseInfo } from "../../pagina/privado/FormularioAsistencia/FormularioAsistencia";

/**
 * Selector de clase cuando hay múltiples horarios en curso.
 * Muestra tarjetas clickeables con nombre de clase, horario y sala.
 */
type SelectorClaseProps = {
	horarios: ClaseInfo[];
	seleccionada: number | null;
	onSeleccionar: (id: number) => void;
};

export const SelectorClase = ({
	horarios,
	seleccionada,
	onSeleccionar,
}: SelectorClaseProps) => (
	<fieldset className="selector_clase">
		<legend>
			<DoorOpen size={16} aria-hidden="true" />
			<span>Seleccioná la clase</span>
		</legend>
		<div className="selector_clase_opciones">
			{horarios.map((h) => {
				const estaSeleccionada = h.id === seleccionada;
				return (
					<button
						key={h.id}
						type="button"
						className={`selector_clase_opcion${estaSeleccionada ? " seleccionada" : ""}`}
						onClick={() => onSeleccionar(h.id)}
						aria-pressed={estaSeleccionada}
					>
						<span className="selector_clase_nombre">{h.nombre_clase}</span>
						<span className="selector_clase_detalle">
							{h.hora_inicio} – {h.hora_fin}
							{h.sala ? ` · ${h.sala}` : ""}
						</span>
					</button>
				);
			})}
		</div>
	</fieldset>
);
