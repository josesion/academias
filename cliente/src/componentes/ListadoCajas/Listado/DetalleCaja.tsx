import { Wallet, ChevronRight, Download } from "lucide-react";
import { ComponenteCargando } from "../../generales/Cargando/Cargando";

import "./detallecajas.css";

interface DetalleProps {
  id_caja: number;
  fecha: {
    apertura: string;
    cierre: string;
  };
  hora: {
    apertura: string;
    cierre: string;
  };
  observaciones: string | null;
  monto_sistema: number;
  monto_real: number;
  monto_faltante: number;
  /** Nombre y apellido del usuario que abrió la caja (fallback: correo o "Sin usuario"). */
  usuario_apertura: string;
  /** Nombre y apellido del usuario que cerró la caja (fallback: correo o "Sin usuario"). */
  usuario_cierre: string;
}

interface DetalleCajasProps {
  carga: boolean;
  props: DetalleProps[];
  onAbrirLibroDiario: (idCaja: number) => void;
  /** Texto del botón exportar, por defecto "Exportar CSV". */
  textoExportar?: string;
}

// tres estados posibles, no dos — faltante, sobrante y exacta se
// tratan cada uno como algo distinto, no "ok" vs "no ok"
type EstadoArqueo = "faltante" | "sobrante" | "exacta";

const calcularEstado = (montoFaltante: number): EstadoArqueo => {
  if (montoFaltante < 0) return "faltante";
  if (montoFaltante > 0) return "sobrante";
  return "exacta";
};

const TEXTO_SELLO: Record<EstadoArqueo, string> = {
  faltante: "Faltante",
  sobrante: "Sobrante",
  exacta: "Caja OK",
};

const TEXTO_LABEL_DIFERENCIA: Record<EstadoArqueo, string> = {
  faltante: "Faltante",
  sobrante: "Sobrante",
  exacta: "Diferencia",
};

/** Texto por defecto cuando el server no trae el usuario de la caja. */
const USUARIO_POR_DEFECTO = "Sin usuario";

/**
 * Devuelve el nombre del usuario de la caja con un texto legible (nunca vacío).
 *
 * @param {string | null | undefined} usuario - Nombre que trae el server.
 * @returns {string} El nombre del usuario o "Sin usuario" si no vino nada.
 */
const nombreUsuario = (usuario: string | null | undefined): string => {
  const texto = (usuario ?? "").trim();
  return texto !== "" ? texto : USUARIO_POR_DEFECTO;
};

/** Formatea montos en moneda ARS de forma consistente. */
const formatoMoneda = (valor: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
};

/**
 * Genera y descarga un archivo CSV con el listado de cajas.
 * @param datos - Array de cajas a exportar.
 */
const exportarCSV = (datos: DetalleProps[]) => {
  const encabezados = [
    "ID Caja",
    "Fecha apertura",
    "Fecha cierre",
    "Hora apertura",
    "Hora cierre",
    "Monto sistema",
    "Monto real",
    "Diferencia",
    "Estado",
    "Usuario apertura",
    "Usuario cierre",
    "Observaciones"
  ];

  const estadoLabel = (faltante: number): string => {
    if (faltante < 0) return "Faltante";
    if (faltante > 0) return "Sobrante";
    return "Exacta";
  };

  const filas = datos.map((d) => [
    d.id_caja,
    d.fecha.apertura,
    d.fecha.cierre,
    d.hora.apertura,
    d.hora.cierre,
    d.monto_sistema,
    d.monto_real,
    d.monto_faltante,
    estadoLabel(d.monto_faltante),
    d.usuario_apertura,
    d.usuario_cierre,
    `"${(d.observaciones ?? "").replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    encabezados.join(","),
    ...filas.map((f) => f.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cajas_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const DetalleCajas = ({
  carga,
  props,
  onAbrirLibroDiario,
  textoExportar = "Exportar CSV",
}: DetalleCajasProps) => {
  if (!props || props.length === 0) {
    return (
      <div className="detalle_caja_vacio">
        <div className="detalle_caja_vacio_visual">
          <Wallet size={32} />
        </div>
        <h3 className="detalle_caja_vacio_titulo">
          No hay cajas en el período
        </h3>
        <p className="detalle_caja_vacio_texto">
          Ajusta los filtros de búsqueda o abre una caja para ver el historial.
        </p>
      </div>
    );
  }

  const totalCajas = props.length;

  return (
    <div className="detalle_caja_marco">
      {/* Título con botón exportar */}
      <div className="detalle_caja_titulo">
        <div className="detalle_caja_titulo_izq">
          <Wallet size={14} />
          <span>Histórico de cajas cerradas</span>
        </div>
        {totalCajas > 0 && (
          <button
            className="detalle_caja_btn_exportar"
            onClick={() => exportarCSV(props)}
            title="Descargar listado como CSV"
            aria-label="Exportar listado de cajas a CSV"
          >
            <Download size={14} />
            <span>{textoExportar}</span>
          </button>
        )}
      </div>

      {carga ? (
        <ComponenteCargando local />
      ) : (
        <div
          className="detalle_caja_lista"
          role="list"
          aria-label={`Histórico de cajas cerradas (${totalCajas} cajas)`}
        >
          {props.map((detalle) => {
            const estado = calcularEstado(detalle.monto_faltante);
            const idSello = `sello-${detalle.id_caja}`;
            const idMontos = `montos-${detalle.id_caja}`;
            const sistema = formatoMoneda(detalle.monto_sistema);
            const real = formatoMoneda(detalle.monto_real);
            const usuarioApertura = nombreUsuario(detalle.usuario_apertura);
            const usuarioCierre = nombreUsuario(detalle.usuario_cierre);
            const diferenciaTexto =
              estado === "exacta"
                ? "Sin diferencia"
                : `${estado === "sobrante" ? "+" : "-"}${formatoMoneda(
                    Math.abs(detalle.monto_faltante),
                  )}`;

            return (
              <button
                key={detalle.id_caja}
                className={`detalle_caja_card ${estado}`}
                role="listitem"
                aria-labelledby={idSello}
                title={`Caja #${detalle.id_caja}`}
                onClick={() => onAbrirLibroDiario(detalle.id_caja)}
              >
                {/* Tooltip con ID de caja */}
                <span className="detalle_caja_id_tooltip">#{detalle.id_caja}</span>
                {/* Cabecera: fechas + sello en una línea */}
                <header className="detalle_caja_cabecera">
                  <div className="detalle_caja_fechas">
                    <span className="detalle_caja_rango">
                      {detalle?.fecha?.apertura ?? "-"} →{" "}
                      {detalle?.fecha?.cierre ?? "-"}
                    </span>
                    <span className="detalle_caja_horas">
                      {detalle?.hora?.apertura ?? "-"} —{" "}
                      {detalle?.hora?.cierre ?? "-"}
                    </span>
                  </div>

                  <div
                    id={idSello}
                    className={`detalle_caja_sello sello_${estado}`}
                    aria-live="polite"
                  >
                    {TEXTO_SELLO[estado]}
                  </div>
                </header>

                {/* Diferencia como dato hero */}
                <div className="detalle_caja_diferencia">
                  <span className={`detalle_caja_diferencia_valor monto_${estado}`}>
                    {diferenciaTexto}
                  </span>
                  <span className="detalle_caja_diferencia_label">
                    {TEXTO_LABEL_DIFERENCIA[estado]}
                  </span>
                </div>

                {/* Montos en línea */}
                <div className="detalle_caja_montos">
                  <div className="monto_item">
                    <span className="monto_label">Sistema</span>
                    <span className="monto_valor">{sistema}</span>
                  </div>
                  <div className="monto_item">
                    <span className="monto_label">Real</span>
                    <span className="monto_valor">{real}</span>
                  </div>
                </div>

                {/* Usuarios compactos */}
                <div className="detalle_caja_usuarios">
                  <span className="detalle_caja_usuario">
                    Abrió: {usuarioApertura}
                  </span>
                  <span className="detalle_caja_usuario_sep" aria-hidden="true">
                    ·
                  </span>
                  <span className="detalle_caja_usuario">
                    Cerró: {usuarioCierre}
                  </span>
                </div>

                {/* Observaciones */}
                {detalle.observaciones && (
                  <div className="detalle_caja_obs">
                    {detalle.observaciones}
                  </div>
                )}

                {/* Indicador de acción */}
                <span className="detalle_caja_accion" aria-hidden="true">
                  Ver detalle
                  <ChevronRight size={14} />
                </span>

                {/* Accesibilidad */}
                <div id={idMontos} className="visually-hidden">
                  Sistema: {sistema}, Real: {real}, Diferencia: {diferenciaTexto}.
                  Abrió: {usuarioApertura}. Cerró: {usuarioCierre}.
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
