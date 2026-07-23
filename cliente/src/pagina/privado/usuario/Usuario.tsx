import "./usuario.css";
import { useRef, useState, useEffect } from "react";

import { TarjetaMetrica } from "../../../componentes/TajetaMetricas/TarjetaMetrica";
import { InfoClases } from "../../../componentes/Clases/Clases";
import { Asistencia } from "../../../componentes/Asistencias/Asistencias";
import { MetricasHistorial } from "../../../componentes/Historial/Historial.metricas";

import { metricasUsuarioSeting } from "../../../hookNegocios/metricasUsuarios";

export const UsuarioPage = () => {
  const refGrupo1 = useRef<HTMLElement>(null);
  const [altoGrupo1, setAltoGrupo1] = useState<number>();

  useEffect(() => {
    if (!refGrupo1.current) return;

    const observer = new ResizeObserver((entries) => {
      setAltoGrupo1(entries[0].contentRect.height);
    });

    observer.observe(refGrupo1.current);
    return () => observer.disconnect();
  }, []);

  const { state } = metricasUsuarioSeting();
  console.log(state);

  return (
    <div className="usuario_contenedor_metricas">
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

          <TarjetaMetrica
            carga={state.carga.tarjeta}
            tipo="caja"
            titulo="Total caja"
            valor={state.tarjetas?.total_caja || 0}
            leyenda="En esta sesion"
          />
        </div>
        <div className="usuario_contenido_clases">
          <InfoClases
            estado={state.clases ? "EN CURSO" : "SIN CURSO"}
            horario={
              state.clases?.horario ? state.clases.horario : "Sin Horario."
            }
            nombre_clase={
              state.clases?.nombre_clase
                ? state.clases.nombre_clase
                : "Sin Clase."
            }
            nombre_profesor={
              state.clases?.nombre_clase
                ? state.clases.nombre_profesor
                : "Sin Profesor."
            }
            carga={state.carga.clases}
          />

          <Asistencia asistencia={state.asistencias ? state.asistencias : []} />
        </div>
      </section>

      {/* =======================
          CONTENIDO PRINCIPAL
      ======================== */}
      <section
        className="usuario_metricas_grupo2"
        style={altoGrupo1 ? { height: altoGrupo1 } : undefined}
      >
        <div className="usuario_contenido_historial">
          <MetricasHistorial historial={state.historial} />
        </div>
      </section>
    </div>
  );
};
