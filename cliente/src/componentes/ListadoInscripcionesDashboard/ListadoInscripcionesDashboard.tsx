import { useId } from "react";
import { useInscripcionesDashboard } from "../../hooks/dashboard/useInscripcionesDashboard";
import { formatearFechaCorta } from "../../utils/fecha";
import { ComponenteCargando } from "../generales/Cargando/Cargando";
import "./listadoInscripcionesDashboard.css";

/**
 * Determina la clase CSS según los días hasta vencimiento.
 *
 * @param dias - Días restantes hasta el vencimiento.
 * @returns Clase CSS para el indicador de estado.
 */
function claseEstado(dias: number): string {
  if (dias <= 7) return "estado_critico";
  if (dias <= 14) return "estado_advertencia";
  return "estado_normal";
}

/**
 * Etiqueta corta para mostrar en la fila de inscripción.
 *
 * @param dias - Días restantes hasta el vencimiento.
 * @returns Texto descriptivo del estado.
 */
function etiquetaEstado(dias: number): string {
  if (dias < 0) return "Vencida";
  if (dias === 0) return "Hoy";
  if (dias <= 7) return `${dias}d`;
  if (dias <= 14) return `${dias}d`;
  return `${dias}d`;
}

/**
 * Opciones del filtro de inscripciones del dashboard.
 */
const OPCIONES_FILTRO = [
  { valor: "todos" as const, etiqueta: "Todas" },
  { valor: "por_vencer" as const, etiqueta: "Por vencer" },
  { valor: "ultimas" as const, etiqueta: "Últimas" },
] as const;

/**
 * Listado compacto de inscripciones para el dashboard principal.
 *
 * Muestra las últimas 20 inscripciones con filtros (todas, por vencer, últimas)
 * e indicadores visuales de vencimiento (rojo ≤7 días, amarillo ≤14 días, verde >14 días).
 */
export function ListadoInscripcionesDashboard() {
  const { inscripciones, carga, error, filtro, cambiarFiltro } =
    useInscripcionesDashboard();
  const listaId = useId();

  // Estado de carga
  if (carga) {
    return (
      <section
        className="inscripciones_dashboard"
        aria-label="Inscripciones recientes"
      >
        <header className="inscripciones_dashboard_encabezado">
          <h2 className="inscripciones_dashboard_titulo">
            Inscripciones recientes
          </h2>
        </header>
        <div className="inscripciones_dashboard_cuerpo">
          <ComponenteCargando local />
        </div>
      </section>
    );
  }

  // Estado de error
  if (error) {
    return (
      <section
        className="inscripciones_dashboard"
        aria-label="Inscripciones recientes"
      >
        <header className="inscripciones_dashboard_encabezado">
          <h2 className="inscripciones_dashboard_titulo">
            Inscripciones recientes
          </h2>
        </header>
        <div className="inscripciones_dashboard_cuerpo error" role="alert">
          <p>No se pudieron cargar las inscripciones: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="inscripciones_dashboard"
      aria-label="Inscripciones recientes"
    >
      <header className="inscripciones_dashboard_encabezado">
        <h2 className="inscripciones_dashboard_titulo">
          Inscripciones recientes
        </h2>

        {/* Filtro tipo píldora */}
        <nav
          className="inscripciones_dashboard_filtro"
          aria-label="Filtrar inscripciones"
        >
          {OPCIONES_FILTRO.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              className={`inscripcion_filtro_btn ${filtro === opcion.valor ? "activo" : ""}`}
              onClick={() => cambiarFiltro(opcion.valor)}
              aria-pressed={filtro === opcion.valor}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </nav>
      </header>

      <div className="inscripciones_dashboard_cuerpo">
        {inscripciones.length === 0 ? (
          <div className="inscripciones_dashboard_vacio" role="status">
            <p>No hay inscripciones para mostrar.</p>
          </div>
        ) : (
          <ul
            id={listaId}
            className="inscripciones_dashboard_lista"
            role="list"
          >
            {inscripciones.map((insc) => (
              <li
                key={insc.id_inscripcion}
                className={`inscripcion_fila ${claseEstado(insc.dias_hasta_vencimiento)}`}
              >
                <div className="inscripcion_fila_principal">
                  <span className="inscripcion_indicador" aria-hidden="true" />
                  <span className="inscripcion_nombre">
                    {insc.nombre_completo}
                  </span>
                  <span className="inscripcion_dni">
                    DNI: {insc.dni_alumno}
                  </span>
                </div>

                <div className="inscripcion_fila_secundario">
                  <span className="inscripcion_plan">{insc.nombre_plan}</span>
                  <span className="inscripcion_vigencia">
                    Vence: {formatearFechaCorta(insc.vigencia)}
                  </span>
                  <span
                    className={`inscripcion_badge ${claseEstado(insc.dias_hasta_vencimiento)}`}
                    title={`${insc.dias_hasta_vencimiento} días hasta vencimiento`}
                  >
                    {etiquetaEstado(insc.dias_hasta_vencimiento)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
