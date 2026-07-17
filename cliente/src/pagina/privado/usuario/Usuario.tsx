import "./usuario.css";

import { TarjetaMetrica } from "../../../componentes/TajetaMetricas/TarjetaMetrica";
import { InfoClases } from "../../../componentes/Clases/Clases";
import { Asistencia } from "../../../componentes/Asistencias/Asistencias";

import { metricasUsuarioSeting } from "../../../hookNegocios/metricasUsuarios";

export const UsuarioPage = () => {
  const { state } = metricasUsuarioSeting();
  console.log(state);

  return (
    <div className="usuario_contenedor">
      {/* =======================
          MÉTRICAS SUPERIORES
      ======================== */}
      <section className="usuario_metricas">
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
      </section>

      {/* =======================
          CONTENIDO PRINCIPAL
      ======================== */}
      <section className="usuario_contenido">
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
      </section>
    </div>
  );
};
