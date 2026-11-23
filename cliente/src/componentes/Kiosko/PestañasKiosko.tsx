import { Key, QrCode } from "lucide-react";

/**
 * Tipo de pestaña activa en el kiosko.
 */
export type Pestaña = "pin" | "qr";

/**
 * Pestañas para alternar entre PIN y QR en el kiosko.
 */
type PestañasKioskoProps = {
	activa: Pestaña;
	onChange: (tab: Pestaña) => void;
};

export const PestañasKiosko = ({ activa, onChange }: PestañasKioskoProps) => (
	<div
		className="pestanas_kiosko"
		role="tablist"
		aria-label="Método de asistencia"
	>
		<button
			type="button"
			role="tab"
			className={`pestanas_kiosko_boton${activa === "pin" ? " activa" : ""}`}
			aria-selected={activa === "pin"}
			aria-controls="panel-pin"
			id="tab-pin"
			onClick={() => onChange("pin")}
		>
			<Key size={16} aria-hidden="true" />
			<span>PIN</span>
		</button>
		<button
			type="button"
			role="tab"
			className={`pestanas_kiosko_boton${activa === "qr" ? " activa" : ""}`}
			aria-selected={activa === "qr"}
			aria-controls="panel-qr"
			id="tab-qr"
			onClick={() => onChange("qr")}
		>
			<QrCode size={16} aria-hidden="true" />
			<span>QR</span>
		</button>
	</div>
);
