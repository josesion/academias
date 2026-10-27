import "./usuario.css";
import { useRef, useState, useEffect, useId } from "react";

import { TarjetaMetrica } from "../../../componentes/Metricas/TajetaMetricas/TarjetaMetrica";
import { AlertaVencimiento } from "../../../componentes/AlertaVencimiento/AlertaVencimiento";
import { Asistencia } from "../../../componentes/Horarios/Asistencias/Asistencias";
import { MetricasHistorial } from "../../../componentes/Historial/Historial.metricas";
import { AsistenciaRapida } from "../../../componentes/AsistenciaRapida/AsistenciaRapida";
import { Boton } from "../../../componentes/generales/Boton/Boton";
import { metricasUsuarioSeting } from "../../../hookNegocios/metricasUsuarios";
import { diasHastaVencimiento } from "../../../utils/fecha";

export const UsuarioPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const refGrupo1 = useRef<HTMLElement>(null);
  const [altoGrupo1, setAltoGrupo1] = useState<number>();

  const metricasId = useId();
  const clasesId = useId();
  const historialId = useId();

  useEffect(() => {
    if (!refGrupo1.current) return;

    const observer = new ResizeObserver((entries) => {
      setAltoGrupo1(entries[0].contentRect.height);
    });

    observer.observe(refGrupo1.current);
    return () => observer.disconnect();
  }, []);

  const { state, rolTipo, refrescarAsistencia } = metricasUsuarioSeting();

  // La tarjeta de vencimiento solo se pinta con carga (skeleton), con error
  // o con 7 días o menos para el vencimiento. El padding de reserva del
  // historial (`con_alerta`) se aplica solo en esos casos: con más días la
  // alerta no se ve y el padding sería espacio vacío escrolleable al final
  // del historial.
  const [alertaVisible, setAlertaVisible] = useState(false);

  useEffect(() => {
    const dias = diasHastaVencimiento(state.fechaVencimiento?.fecha_vencimiento);

    setAlertaVisible(
      Boolean(state.carga.vencimiento) ||
        Boolean(state.error.vencimiento) ||
        (dias !== null && dias <= 7)
    );
  }, [
    state.fechaVencimiento,
    state.carga.vencimiento,
    state.error.vencimiento,
  ]);

  // Carga global: se muestra mientras haya cualquier carga crítica inicial
  const cargandoGlobal = state.carga.tarjeta || state.carga.clases || state.carga.historial || state.carga.vencimiento;
  const [modalAbierto, setModalAbierto] = useState(false);

  const cerrarAsistenciaRapida = () => setModalAbierto(false);

  return (
    // NO va `<main>` ni `role="main"`: el layout (`menuManager.tsx`) ya aporta
    // el unico `<main id="contenido_principal">` de la pagina (y es el destino
    // del skip link). Un segundo landmark `main` anidado es invalido.
    <div className="usuario_contenedor_metricas" ref={containerRef}>
      {/* Carga global inicial */}
      {cargandoGlobal && (
        <div className="carga-global" aria-live="polite" aria-busy="true">
          <div className="spinner" aria-hidden="true" />
          <span className="visually-hidden">Cargando panel de la academia...</span>
        </div>
      )}

      {/* Encabezado: h1 visible */}
      <header className="usuario_encabezado">
        <div className="usuario_encabezado_titulos">
          <span className="usuario_encabezado_etiqueta">Principal</span>

          <h1>Panel de la academia</h1>

          <p>Alumnos, asistencia y actividad reciente de tu escuela.</p>
        </div>
        <Boton
          clase="listar"
          texto="Asistencia rápida"
          logo="List"
          onClick={() => setModalAbierto(true)}
          aria-label="Abrir asistencia rápida manual"
        />
      </header>
      <AsistenciaRapida abierto={modalAbierto} onCerrar={cerrarAsistenciaRapida} onAsistenciaRegistrada={refrescarAsistencia} />
      {/* =======================
          MÉTRICAS SUPERIORES
      ======================== */}
      <section aria-labelledby={metricasId} className="usuario_metricas_grupo1" ref={refGrupo1}>
        <h2 id={metricasId} className="visually-hidden">Métricas principales</h2>
        <div className="usuario_metricas_tarjetas" role="list" aria-label="Tarjetas de métricas de la academia">
          <TarjetaMetrica
            carga={state.carga.tarjeta}
            tipo="activos"
            titulo="Alumnos"
            valor={state.tarjetas?.total_activos ?? 0}
            leyenda="Con planes activos."
          />
          <TarjetaMetrica
            carga={state.carga.tarjeta}
            tipo="nuevos"
            titulo="Alumnos Nuevos"
            valor={state.tarjetas?.nuevos_este_mes ?? 0}
            porcentaje={state.tarjetas?.porcentaje_nuevos}
          />
          <TarjetaMetrica
            carga={state.carga.tarjeta}
            tipo="por_vencer"
            titulo="Prox. vencimientos"
            valor={state.tarjetas?.vencen_proximos ?? 0}
            leyenda="En 7 dias"
          />
          <TarjetaMetrica
            carga={state.carga.tarjeta}
            tipo="vencidos"
            titulo="Vencidos"
            valor={state.tarjetas?.vencidos_este_mes ?? 0}
            leyenda="De este mes"
          />
          {rolTipo === "intermedio" && (
            <TarjetaMetrica
              carga={state.carga.tarjeta}
              tipo="caja"
              titulo="Total caja"
              valor={state.tarjetas?.total_caja ?? 0}
              leyenda="En esta sesion"
            />
          )}
        </div>
        <div className="usuario_contenido_clases">
          <section aria-labelledby={clasesId} className="usuario_clases_section">
            <h2 id={clasesId} className="visually-hidden">Clases y asistencia</h2>
            <Asistencia
              asistencia={state.asistencias ?? []}
              clases={state.clases}
              estadoClase={state.clases ? "EN CURSO" : "SIN CURSO"}
              cargaClases={state.carga.clases}
            />
          </section>
        </div>
      </section>

      {/* =======================
          CONTENIDO PRINCIPAL - HISTORIAL
      ======================== */}
      <section aria-labelledby={historialId} className="usuario_metricas_grupo2" style={altoGrupo1 ? { height: altoGrupo1 } : undefined}>
        <h2 id={historialId} className="visually-hidden">Historial de movimientos</h2>
        {/* `con_alerta` reserva ~245px al final del scroll para que la tarjeta
            flotante (en portal al body) no tape la última entrada del
            historial. Solo se aplica cuando la alerta se muestra de verdad
            (carga, error o ≤ 7 días): con más días sería espacio vacío
            escrolleable. */}
        <div
          className={`usuario_contenido_historial ${alertaVisible ? "con_alerta" : ""}`}
          role="region"
          aria-label="Historial de movimientos"
        >
          <MetricasHistorial historial={state.historial ?? []} />
        </div>

        {state.fechaVencimiento && (
          <AlertaVencimiento
            fechaVencimiento={state.fechaVencimiento?.fecha_vencimiento}
            carga={state.carga.vencimiento}
            mensajeError={state.error.vencimiento}
          />
        )}
      </section>
    </div>
  );
};