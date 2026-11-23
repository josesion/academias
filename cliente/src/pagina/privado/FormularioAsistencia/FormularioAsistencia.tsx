import { useRef, useEffect, useMemo, useState, useCallback } from "react";

import {
	CalendarClock,
	Clock3,
	UserCheck,
	CalendarDays,
} from "lucide-react";

// Componentes generales
import { CompoError } from "../../../componentes/generales/Error/Error";
import { Boton } from "../../../componentes/generales/Boton/Boton";
import { Inputs } from "../../../componentes/generales/Inputs/Inputs";

// Componentes del kiosko
import { GeneradorQR } from "../../../componentes/Kiosko/GeneradorQR";
import { GrupoClases } from "../../../componentes/Kiosko/GrupoClases";
import { SelectorClase } from "../../../componentes/Kiosko/SelectorClase";
import { SelectorClaseQR } from "../../../componentes/Kiosko/SelectorClaseQR";
import { ExitoAsistencia } from "../../../componentes/Kiosko/ExitoAsistencia";
import { PestañasKiosko } from "../../../componentes/Kiosko/PestañasKiosko";
import type { Pestaña } from "../../../componentes/Kiosko/PestañasKiosko";

// Hook
import { useAsistenciaSet } from "../../../hookNegocios/asistencia";

// Tipados
import type * as TipadoAsistencia from "../../../tipadosTs/asistencia.typado";

// CSS
import "./formularioAsistencia.css";

/* ==========================================================
   TIPOS Y HELPERS
   Se quedan aquí porque dependen de los tipos del fetch.
   ========================================================== */

export type ClaseInfo = {
	nombre_clase: string;
	hora_inicio: string;
	hora_fin: string;
	sala?: string;
	id: number;
};

const esHorarioValido = (h: unknown): h is TipadoAsistencia.ResultadoClaseEnCruso =>
	typeof h === "object" &&
	h !== null &&
	"id_horario_en_clase" in h &&
	"nombre_clase" in h &&
	"hora_inicio" in h;

const esProximaClaseValida = (h: unknown): h is TipadoAsistencia.ResultadoClaseProxima =>
	typeof h === "object" &&
	h !== null &&
	"id_horario_prox_clase" in h &&
	"nombre_clase" in h &&
	"hora_inicio" in h;

/* ==========================================================
   COMPONENTE PRINCIPAL
   ========================================================== */

export const FormularioAsistencia = () => {
	const inputDniRef = useRef<HTMLInputElement>(null);
	const qrRef = useRef<HTMLDivElement>(null);

	const {
		handleCachearAlumno,
		handleResgistrarAsistencia,
		handleSeleccionarClase,
		state,
	} = useAsistenciaSet();

	// Pestaña activa: PIN (default) o QR
	const [pestañaActiva, setPestañaActiva] = useState<Pestaña>("pin");

	// Selección de clase para QR: id y tipo (curso/proxima)
	const [qrClaseId, setQrClaseId] = useState<number | null>(null);
	const [qrClaseTipo, setQrClaseTipo] = useState<"curso" | "proxima" | null>(
		null,
	);

	// Extraer las listas de clases del estado (ahora son arrays)
	const clasesEnCurso = useMemo(() => {
		const data = state.claseEnCurso;
		if (Array.isArray(data)) {
			return data.filter(esHorarioValido).map((c) => ({
				nombre_clase: c.nombre_clase,
				hora_inicio: c.hora_inicio,
				hora_fin: c.hora_fin,
				sala: c.sala,
				id: c.id_horario_en_clase,
			}));
		}
		return [];
	}, [state.claseEnCurso]);

	const clasesProximas = useMemo(() => {
		const data = state.claseProxima;
		if (Array.isArray(data)) {
			return data.filter(esProximaClaseValida).map((c) => ({
				nombre_clase: c.nombre_clase,
				hora_inicio: c.hora_inicio,
				hora_fin: c.hora_fin,
				sala: c.sala,
				id: c.id_horario_prox_clase,
			}));
		}
		return [];
	}, [state.claseProxima]);

	// Horarios del dataAsistencia (para el selector de clase al registrar)
	const horariosEnCurso = useMemo(() => {
		const dataHorario = state.dataAsistencia.dataHorario;
		if (Array.isArray(dataHorario)) {
			return dataHorario
				.filter((item): item is TipadoAsistencia.DataHorarioAsistencia =>
					"id_horario_clase" in item && "nombre_clase" in item && "hora_inicio" in item
				)
				.map((c) => ({
					nombre_clase: c.nombre_clase,
					hora_inicio: c.hora_inicio,
					hora_fin: c.hora_fin,
					sala: c.sala,
					id: c.id_horario_clase,
				}));
		}
		return [];
	}, [state.dataAsistencia.dataHorario]);

	const hayMultiplesClases = horariosEnCurso.length > 1;

	// Clase seleccionada para QR: buscar en las listas
	const qrClaseSeleccionada = useMemo(() => {
		if (qrClaseId == null) return null;
		if (qrClaseTipo === "curso") {
			return clasesEnCurso.find((c) => c.id === qrClaseId) ?? null;
		}
		if (qrClaseTipo === "proxima") {
			return clasesProximas.find((c) => c.id === qrClaseId) ?? null;
		}
		return null;
	}, [qrClaseId, qrClaseTipo, clasesEnCurso, clasesProximas]);

	const handleSeleccionarClaseQR = useCallback(
		(id: number, tipo: "curso" | "proxima") => {
			setQrClaseId(id);
			setQrClaseTipo(tipo);
		},
		[],
	);

	// Cuando se selecciona una clase, hacer scroll al QR
	useEffect(() => {
		if (qrClaseId != null && qrRef.current) {
			const timer = setTimeout(() => {
				qrRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [qrClaseId]);

	useEffect(() => {
		if (!state.exitoAsistencia) {
			inputDniRef.current?.focus();
		}
	}, [state.exitoAsistencia]);

	return (
		<div className="asistencia_kiosco">
			<header className="asistencia_header">
				<h1>{state.nombreEscuela}</h1>
				<p>Registro automático de asistencia</p>
			</header>

			<main className="asistencia_panel">
				<section className="asistencia_clases" aria-label="Clases de hoy">
					<GrupoClases
						variante="actual"
						etiqueta="En curso"
						Icono={Clock3}
						clases={clasesEnCurso}
						textoVacio="Sin clase en curso"
					/>

					<GrupoClases
						variante="proxima"
						etiqueta="Próxima"
						Icono={CalendarDays}
						clases={clasesProximas}
						textoVacio="Sin más clases por hoy"
					/>
				</section>

				{/* Pestañas PIN / QR */}
				<PestañasKiosko activa={pestañaActiva} onChange={setPestañaActiva} />

				{/* Panel PIN */}
				{pestañaActiva === "pin" && (
					<section
						className="asistencia_accion"
						id="panel-pin"
						role="tabpanel"
						aria-labelledby="tab-pin"
					>
						<h2 className="titulo_accion" id="asistencia_titulo">
							<UserCheck size={18} aria-hidden="true" />
							<span>Identificación del alumno</span>
						</h2>

						<Inputs
							label="Ingrese su PIN de asistencia"
							placeholder="Ej: 2372"
							name="pin_asistencia"
							type="text"
							inputMode="numeric"
							maxLength={4}
							ref={inputDniRef}
							value={state.registroAsistencia.pin_asistencia}
							readonly={false}
							onChange={handleCachearAlumno}
						/>

						{/* Selector de clase cuando hay múltiples horarios en curso */}
						{hayMultiplesClases && (
							<SelectorClase
								horarios={horariosEnCurso}
								seleccionada={state.claseSeleccionada}
								onSeleccionar={handleSeleccionarClase}
							/>
						)}

						<dl className="estado_inscripcion">
							<div className="estado_card">
								<dt>Vencimiento</dt>
								<dd>{state.dataInscripcion?.vencimiento || "----/--/--"}</dd>
							</div>

							<div className="estado_card">
								<dt>Clases restantes</dt>
								{/* ?? y no ||: con 0 clases restantes tiene que mostrar "0" */}
								<dd>{state.dataInscripcion?.clases_restantes ?? "-"}</dd>
							</div>
						</dl>

						<Boton
							clase="aceptar"
							texto="Registrar asistencia"
							logo="Go"
							onClick={handleResgistrarAsistencia}
						/>

						{state.errorGenerico && (
							<CompoError mensaje={state.errorGenerico} />
						)}
					</section>
				)}

				{/* Panel QR */}
				{pestañaActiva === "qr" && (
					<section
						className="asistencia_accion"
						id="panel-qr"
						role="tabpanel"
						aria-labelledby="tab-qr"
					>
						<h2 className="titulo_accion">
							<CalendarClock size={18} aria-hidden="true" />
							<span>Código QR de asistencia</span>
						</h2>

						<SelectorClaseQR
							clasesEnCurso={clasesEnCurso}
							clasesProximas={clasesProximas}
							seleccionada={qrClaseId}
							tipoSeleccionado={qrClaseTipo}
							onSeleccionar={handleSeleccionarClaseQR}
						/>

						{qrClaseSeleccionada && (
							<div ref={qrRef}>
								<GeneradorQR
									idHorarioClase={qrClaseSeleccionada.id}
									nombreClase={qrClaseSeleccionada.nombre_clase}
									horaInicio={qrClaseSeleccionada.hora_inicio}
									horaFin={qrClaseSeleccionada.hora_fin}
									sala={qrClaseSeleccionada.sala}
								/>
							</div>
						)}
					</section>
				)}
			</main>

			{state.exitoAsistencia && <ExitoAsistencia />}
		</div>
	);
};
