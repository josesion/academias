import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import { CompoError } from "../../generales/Error/Error";
import { Boton } from "../../generales/Boton/Boton";
import { formatearFechaHora } from "../../../utils/fecha";
import { type FilaLogEventos } from "../../../servicio/logs.fetch";
import "./listadologs.css";

/** Cuántos caracteres del `detalle` JSON se muestran antes de cortar. */
const LARGO_DETALLE = 120;

/** Props de la fila individual de la bitácora */
interface LogItemProps {
    evento: FilaLogEventos;
    /** Al clickear el botón de la fila: marca/desmarca ese evento */
    onMarcar: (evento: FilaLogEventos) => void;
}

/**
 * Clase del filete y del chip de `nivel`: el color lo pone el nivel del evento
 * (`error` rojo, `warn` ámbar, `info` salvia). Es el único acento de color de
 * la fila: el resto es tinta y monoespaciada, como el resto de la página.
 *
 * @param nivel - Nivel del evento tal como lo manda el server.
 * @returns {string} El modificador CSS (`log_evento--error`, etc.).
 */
const claseNivel = (nivel: string) => {
    const n = (nivel || "").toLowerCase();
    if (n === "error") return "log_evento--error";
    if (n === "warn" || n === "warning") return "log_evento--warn";
    return "log_evento--info";
};

/**
 * Pasa el `detalle` (objeto JSON o null) a una sola línea de texto.
 *
 * @param detalle - Columna `detalle` de la fila; puede ser `null`.
 * @returns {string} El JSON recortado, o `""` si no hay detalle.
 */
const textoDetalle = (detalle: Record<string, unknown> | null) => {
    if (!detalle) return "";

    const plano = JSON.stringify(detalle);
    if (!plano) return "";

    // 120 + 3 del "..." para que se note el corte
    return plano.length > LARGO_DETALLE
        ? `${plano.slice(0, LARGO_DETALLE)}...`
        : plano;
};

/** Lista compacta con lo técnico de la fila: método, ruta, respuesta y duración. */
const pintarHttp = (evento: FilaLogEventos) => {
    const partes = [
        evento.metodo_http,
        evento.ruta,
        evento.estado_http !== null ? String(evento.estado_http) : null,
        evento.duracion_ms !== null ? `${evento.duracion_ms} ms` : null,
    ].filter(Boolean);

    return partes.length > 0 ? partes.join("  ") : "—";
};

/**
 * Fila de la bitácora.
 *
 * Va **apilada** (no con columnas) para que se lea igual de bien en un panel
 * angosto que en uno ancho: encabezado con nivel y origen, la línea HTTP, el
 * mensaje, el detalle recortado y el botón de marcar.
 *
 * @param evento - Fila del listado de eventos.
 * @param onMarcar - Callback que dispara el PUT de la fila.
 */
const LogItem = ({ evento, onMarcar }: LogItemProps) => {
    const detalle = textoDetalle(evento.detalle);
    const revisado = evento.resuelto === 1;

    return (
        <article
            className={`log_evento ${claseNivel(evento.nivel)} ${revisado ? "log_evento--resuelto" : ""}`}
        >
            {/* Nivel, origen, fecha y quién lo provocó: la línea de contexto */}
            <div className="log_evento_cabecera">
                <span className="log_nivel">{evento.nivel}</span>

                <span className="log_origen">{evento.origen}</span>

                {revisado && <span className="log_revisado">Revisado</span>}

                <span className="log_fecha">{formatearFechaHora(evento.fecha)}</span>

                {evento.usuario_nom && (
                    <span className="log_usuario">{evento.usuario_nom}</span>
                )}
            </div>

            {/* Método, ruta, estado y duración: datos, en monoespaciada */}
            <p className="log_http">{pintarHttp(evento)}</p>

            {/* Qué pasó */}
            <p className="log_mensaje">{evento.mensaje}</p>

            {/* Contexto crudo del evento, recortado */}
            {detalle && <p className="log_detalle">{detalle}</p>}

            {/* Marcar/desmarcar: la única acción de la fila */}
            <div className="log_evento_accion">
                <Boton
                    clase={revisado ? "eliminar" : "aceptar"}
                    logo={revisado ? "Back" : "Check"}
                    texto={revisado ? "Marcar pendiente" : "Marcar revisado"}
                    type="button"
                    onClick={() => onMarcar(evento)}
                />
            </div>
        </article>
    );
};

/** Props del listado de eventos */
interface ListadoLogsProps {
    /** Filas a pintar */
    eventos: FilaLogEventos[];
    /** ¿Cargando? → spinner */
    carga: boolean;
    /** Aviso de la bitácora (server caído, sesión vencida…). Null = sin error */
    error?: string | null;
    /** Al clickear el botón de una fila: dispara el PUT de marcar/desmarcar */
    onMarcar: (evento: FilaLogEventos) => void;
}

/**
 * Bitácora del sistema: spinner / vacío / filas + aviso.
 *
 * No trae paginador propio: lo pinta `Admin.tsx` en el bloque `admin_pie` de su
 * panel, igual que el de suscripciones.
 *
 * @param eventos - Filas de eventos ya paginadas por el server.
 * @param carga - Si hay que mostrar el spinner en vez de las filas.
 * @param error - Aviso de error de la bitácora.
 * @param onMarcar - Callback del botón de marcar de cada fila.
 */
export const ListadoLogs = ({
    eventos,
    carga,
    error,
    onMarcar,
}: ListadoLogsProps) => {
    return (
        <section className="listado_logs">
            {carga ? (
                <SpinnerTarjeta />
            ) : eventos.length === 0 ? (
                <p className="listado_logs_vacio">
                    No hay eventos para mostrar.
                </p>
            ) : (
                <div className="listado_logs_lista">
                    {eventos.map((evento) => (
                        <LogItem
                            key={evento.id_log}
                            evento={evento}
                            onMarcar={onMarcar}
                        />
                    ))}
                </div>
            )}

            {/* Aviso de la bitácora (server caído / sesión vencida) */}
            {error && <CompoError mensaje={error} />}
        </section>
    );
};