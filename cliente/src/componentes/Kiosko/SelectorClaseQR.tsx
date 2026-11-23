import { CalendarClock, DoorOpen } from "lucide-react";

import type { ClaseInfo } from "../../pagina/privado/FormularioAsistencia/FormularioAsistencia";

/**
 * Selector de clase para la pestaña QR: combina clases en curso y próximas.
 */
type SelectorClaseQRProps = {
	clasesEnCurso: ClaseInfo[];
	clasesProximas: ClaseInfo[];
	seleccionada: number | null;
	tipoSeleccionado: "curso" | "proxima" | null;
	onSeleccionar: (id: number, tipo: "curso" | "proxima") => void;
};

export const SelectorClaseQR = ({
	clasesEnCurso,
	clasesProximas,
	seleccionada,
	tipoSeleccionado,
	onSeleccionar,
}: SelectorClaseQRProps) => {
	const todasClases: Array<{
		id: number;
		nombre: string;
		hora: string;
		sala?: string;
		tipo: "curso" | "proxima";
		etiqueta: string;
	}> = [
		...clasesEnCurso.map((c) => ({
			id: c.id,
			nombre: c.nombre_clase,
			hora: `${c.hora_inicio} – ${c.hora_fin}`,
			sala: c.sala,
			tipo: "curso" as const,
			etiqueta: "En curso",
		})),
		...clasesProximas.map((c) => ({
			id: c.id,
			nombre: c.nombre_clase,
			hora: `${c.hora_inicio} – ${c.hora_fin}`,
			sala: c.sala,
			tipo: "proxima" as const,
			etiqueta: "Próxima",
		})),
	];

	if (todasClases.length === 0) {
		return (
			<div className="selector_qr_vacio">
				<CalendarClock size={20} aria-hidden="true" />
				<p>No hay clases disponibles para generar QR</p>
			</div>
		);
	}

	return (
		<fieldset className="selector_clase">
			<legend>
				<DoorOpen size={16} aria-hidden="true" />
				<span>Seleccioná la clase para generar el QR</span>
			</legend>
			<div className="selector_clase_opciones">
				{todasClases.map((clase) => {
					const estaSeleccionada =
						clase.id === seleccionada && clase.tipo === tipoSeleccionado;
					return (
						<button
							key={`${clase.tipo}-${clase.id}`}
							type="button"
							className={`selector_clase_opcion${estaSeleccionada ? " seleccionada" : ""}`}
							onClick={() => onSeleccionar(clase.id, clase.tipo)}
							aria-pressed={estaSeleccionada}
						>
							<span className="selector_clase_etiqueta">{clase.etiqueta}</span>
							<span className="selector_clase_nombre">{clase.nombre}</span>
							<span className="selector_clase_detalle">
								{clase.hora}
								{clase.sala ? ` · ${clase.sala}` : ""}
							</span>
						</button>
					);
				})}
			</div>
		</fieldset>
	);
};
