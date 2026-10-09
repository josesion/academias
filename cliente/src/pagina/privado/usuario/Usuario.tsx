import "./usuario.css";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { TarjetaMetrica } from "../../../componentes/Metricas/TajetaMetricas/TarjetaMetrica";
import { AlertaVencimiento } from "../../../componentes/AlertaVencimiento/AlertaVencimiento";
import { Asistencia } from "../../../componentes/Horarios/Asistencias/Asistencias";
import { MetricasHistorial } from "../../../componentes/Historial/Historial.metricas";
import { metricasUsuarioSeting } from "../../../hookNegocios/metricasUsuarios";

export const UsuarioPage = () => {
  const containerRef = useRef<HTMLDivElement>(null); // <-- Referencia principal para el scope de GSAP
  const refGrupo1 = useRef<HTMLElement>(null);
  const [altoGrupo1, setAltoGrupo1] = useState<number>();

  const navegar = useNavigate();

  useEffect(() => {
    if (!refGrupo1.current) return;

    const observer = new ResizeObserver((entries) => {
      setAltoGrupo1(entries[0].contentRect.height);
    });

    observer.observe(refGrupo1.current);
    return () => observer.disconnect();
  }, []);

  const { state, rolTipo } = metricasUsuarioSeting();

  return (
    <div className="usuario_contenedor_metricas" ref={containerRef}>

      {/* Encabezado de la pagina: sin esto la pantalla arranca directo con las
          tarjetas y no hay ni jerarquia ni referencia de donde estas. Es el
          mismo patron (eyebrow + h1 + bajada) que usan las paginas de Admin. */}
      <header className="usuario_encabezado">
        <div className="usuario_encabezado_titulos">
          <span className="usuario_encabezado_etiqueta">Principal</span>

          <h1>Panel de la academia</h1>

          <p>Alumnos, asistencia y actividad reciente de tu escuela.</p>
        </div>
      </header>
      {/* =======================
          MÉTRICAS SUPERIORES
      ======================== */}
      <section className="usuario_metricas_grupo1" ref={refGrupo1}>
        <div className="usuario_metricas_tarjetas">
          <TarjetaMetrica
            carga={state.carga.tarjeta}
            tipo="activos"
            titulo="Alumnos"
            valor={state.tarjetas?.total_activos || 0}
            leyenda="Con planes activos."
          />
          <TarjetaMetrica
            carga={state.carga.tarjeta}
            tipo="nuevos"
            titulo="Alumnos Nuevos"
            valor={state.tarjetas?.nuevos_este_mes || 0}
            porcentaje={state.tarjetas?.porcentaje_nuevos}
          />
          <TarjetaMetrica
            carga={state.carga.tarjeta}
            tipo="por_vencer"
            titulo="Prox. vencimientos"
            valor={state.tarjetas?.vencen_proximos || 0}
            leyenda="En 7 dias"
          />
          <TarjetaMetrica
            carga={state.carga.tarjeta}
            tipo="vencidos"
            titulo="Vencidos"
            valor={state.tarjetas?.vencidos_este_mes || 0}
            leyenda="De este mes"
          />
          {rolTipo === "intermedio" && (
            <TarjetaMetrica
              carga={state.carga.tarjeta}
              tipo="caja"
              titulo="Total caja"
              valor={state.tarjetas?.total_caja || 0}
              leyenda="En esta sesion"
            />
          )}
        </div>
        <div className="usuario_contenido_clases">
          <Asistencia
            asistencia={state.asistencias ? state.asistencias : []}
            clases={state.clases}
            estadoClase={state.clases ? "EN CURSO" : "SIN CURSO"}
            cargaClases={state.carga.clases}
          />
        </div>
      </section>

      {/* =======================
          CONTENIDO PRINCIPAL
      ======================== */}
      <section
        className="usuario_metricas_grupo2"
        style={altoGrupo1 ? { height: altoGrupo1 } : undefined}
      >
        {/* `con_alerta` reserva ~250px al final del scroll para que la tarjetaflotante (ahora en portal) no tape la Ultima entrada del historial. */}
        <div className={`usuario_contenido_historial ${state.fechaVencimiento ? "con_alerta" : ""}`}>
          <MetricasHistorial historial={state.historial} />
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
