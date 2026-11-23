import { useState, useEffect, useId, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { EstadoVacio } from "../../../../componentes/SeccionAlumnos/ComponteVacio/ComponteVacio";
import { RobotError } from "../../../../componentes/SeccionAlumnos/RobotRoto/RobotError";

import { HeroEscuela } from "../../../../componentes/SeccionAlumnos/InfoEscuela/InfoEscuela";

import { CarruselFlayers } from "../../../../componentes/Flayers/Carrucel/CarruselFlayers";

import { EstadoPlanActual } from "../../../../componentes/SeccionAlumnos/EstadoAlumno/EstadoPlan";

import { PlanesEscuelaList } from "../../../../componentes/SeccionAlumnos/TarjetasPlanes/TarjetasPlanes";

import { GrillaHorarios } from "../../../../componentes/SeccionAlumnos/Horarios/Horarios";
import { ListadoClasesAsistidas } from "../../../../componentes/SeccionAlumnos/ListadoClasesAsistidas/ListadoClasesAsistidas";
import { SpinnerTarjeta } from "../../../../componentes/Metricas/SipinnerMetricas/SpinnerTajetas";

import { ArrowLeft, Calendar, CheckCircle2, Clock } from "lucide-react";
import "./dataescuela.css";

import { configInfoEscuelas } from "../../../../hookNegocios/infoEscuela";

export const DataEscuela = () => {
  const { state, dispatch, cerrarMensajeError, abrirModalClases, cerrarModalClases, reintentarClases, reintentarHorario } = configInfoEscuelas();
  const { data } = state;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { id_escuela } = location.state || {};
    if (id_escuela) {
      dispatch({ type: "RESET_INFO_ESCUELA" });
      dispatch({ type: "SET_ID_ESCUELA", payload: id_escuela });
    }
  }, [location]);

  const [modalHorario, setModalHorario] = useState(false);

  const horariosId = useId();
  const novedadesId = useId();
  const planesId = useId();
  const grillaId = useId();
  const historialId = useId();

  /**
   * Últimas 10 asistencias para mostrar directamente en la página.
   */
  const ultimasAsistencias = useMemo(() => {
    const asistencias = state.clasesAsistidas ?? [];
    return asistencias.slice(0, 10);
  }, [state.clasesAsistidas]);

  /**
   * Formatea una fecha YYYY-MM-DD a DD/MM/YYYY.
   */
  const formatearFecha = (fechaStr: string): string => {
    if (!fechaStr) return "—";
    const [anio, mes, dia] = fechaStr.split("-");
    return `${dia}/${mes}/${anio}`;
  };

  /**
   * Capitaliza el primer carácter de un string.
   */
  const capitalizarDia = (dia: string): string => {
    if (!dia) return "—";
    return dia.charAt(0).toUpperCase() + dia.slice(1);
  };

  /**
   * Próximas clases de esta academia para los días restantes de la semana.
   * Se calcula a partir del horario semanal ya cargado.
   */
  const proximasClases = useMemo(() => {
    const horarios = state.horario ?? [];
    if (horarios.length === 0) return [];

    // Día actual de la semana (0=domingo, 1=lunes, ..., 6=sábado)
    const diaHoy = new Date().getDay();
    const diasJS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const diaActual = diasJS[diaHoy];

    // Orden de días para filtrar desde hoy hasta domingo
    const ordenDias = [
      "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo",
    ];
    const indiceHoy = ordenDias.indexOf(diaActual);
    if (indiceHoy === -1) return [];

    const diasRestantes = ordenDias.slice(indiceHoy);

    // Filtrar y ordenar las clases de los días restantes
    const proximas = horarios
      .filter((h) => diasRestantes.includes(h.dia_semana))
      .sort((a, b) => {
        // Primero por día de la semana
        const diaA = diasRestantes.indexOf(a.dia_semana);
        const diaB = diasRestantes.indexOf(b.dia_semana);
        if (diaA !== diaB) return diaA - diaB;
        // Luego por hora
        return a.hora_inicio.localeCompare(b.hora_inicio);
      });

    return proximas.slice(0, 7); // Máximo 7 próximas clases
  }, [state.horario]);

  return (
    // NO va `<main>` ni `role="main"`: el layout ya aporta el unico landmark
    // `main` de la pagina. Un segundo `main` anidado es invalido.
    <div className="data-escuela-container">
      {/* Encabezado de la pagina (solo para lectores de pantalla): el nombre de
          la academia viene del `HeroEscuela`, pero hace falta un <h1> propio
          para que la pagina tenga un titulo principal. */}
      <header className="data-escuela-encabezado">
        <h1 className="visually-hidden">Datos de la academia</h1>
      </header>

      {/* 1. Navegación Superior */}
      <nav className="nav-superior" aria-label="Navegación de la academia">
        <button className="btn-volver" onClick={() => navigate("/alumno_principal")}>
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Volver al Panel Principal</span>
        </button>
      </nav>

      {/* 2. Cabecera Institucional y Horarios Juntos Arriba (Grid Superior) */}
      <section className="top-dashboard-grid" aria-label="Informacion de la academia">
        {state.carga.infoEscuela && !data?.heroEscuela ? (
          <SpinnerTarjeta texto="Cargando academia…" />
        ) : data?.heroEscuela ? (
          <HeroEscuela
            escuela={data.heroEscuela}
            carga={state.carga.infoEscuela}
          />
        ) : (
          <EstadoVacio variante="escuela" />
        )}

        <div className="card-horarios-lateral">
          <div className="horarios-texto">
            <h2 id={horariosId} className="seccion-titulo-inline">Horarios de Clases</h2>
            <p>Consultá días, salones y niveles de la academia.</p>
          </div>
          <button
            className="btn-principal"
            onClick={() => setModalHorario(true)}
            aria-haspopup="dialog"
            aria-controls={grillaId}
          >
            <Calendar size={18} aria-hidden="true" />
            <span>Ver Grilla</span>
          </button>
        </div>
      </section>

      {/* 3. Sección de Novedades / Flyers */}
      <section className="seccion-bloque" aria-labelledby={novedadesId}>
        <h2 id={novedadesId} className="seccion-titulo">Novedades y Anuncios</h2>
        {state.carga.infoEscuela && !data?.flayer ? (
          <SpinnerTarjeta texto="Cargando novedades…" />
        ) : data?.flayer ? (
          <CarruselFlayers
            flayers={data.flayer}
            tipo="carrusel"
            cargaSpiner={state.carga.infoEscuela}
          />
        ) : (
          <EstadoVacio variante="flayers" />
        )}
      </section>

      {/* 5. Sección de Planes de Pago y Estado del Alumno */}
      <section className="seccion-bloque" aria-labelledby={planesId}>
        <h2 id={planesId} className="visually-hidden">Planes de pago</h2>

        <div className="">
          {state.carga.infoEscuela && !data?.inscripcion ? (
            <SpinnerTarjeta texto="Cargando plan…" />
          ) : data?.inscripcion ? (
            <EstadoPlanActual
              inscripcion={data.inscripcion}
              carga={state.carga.infoEscuela}
              onVerClases={abrirModalClases}
            />
          ) : (
            <EstadoVacio variante="inscripcion" />
          )}
        </div>

        <div className="grilla-planes" style={{ marginTop: "16px" }}></div>

        {state.carga.infoEscuela && !data?.planes ? (
          <SpinnerTarjeta texto="Cargando planes…" />
        ) : data?.planes ? (
          <PlanesEscuelaList
            planes={data.planes}
            idPlanActual={data.inscripcion?.id_plan}
            carga={state.carga.infoEscuela}
          />
        ) : (
          <EstadoVacio variante="planes" />
        )}
      </section>

      {/* 6. Próximas clases de esta academia */}
      {proximasClases.length > 0 && (
        <section className="seccion-bloque" aria-label="Próximas clases">
          <h2 className="seccion-titulo">Próximas clases esta semana</h2>
          <ul className="historial-asistencias-lista" role="list">
            {proximasClases.map((clase, index) => (
              <li
                key={`${clase.id}-proxima-${index}`}
                className="historial-asistencia-item"
              >
                <div className="historial-asistencia_icono" aria-hidden="true">
                  {index === 0 ? (
                    <Clock size={18} />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                </div>
                <div className="historial-asistencia_info">
                  <span className="historial-asistencia_titulo">
                    {clase.tipo_clase} — {clase.nivel}
                  </span>
                  <span className="historial-asistencia_detalle">
                    {capitalizarDia(clase.dia_semana)} · {clase.hora_inicio}-{clase.hora_fin} · {clase.nombre_profesor} · {clase.sala ?? "Sin sala"}
                  </span>
                </div>
                {index === 0 && (
                  <span className="dias-restantes-badge" style={{ background: "rgba(34,197,94,0.12)", color: "#16a34a" }}>
                    Próxima
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 7. Historial de asistencias — visible en la página, no solo en modal */}
      <section className="historial-asistencias-seccion" aria-labelledby={historialId}>
        <h2 id={historialId} className="seccion-titulo">Historial de asistencias</h2>

        {state.carga.clasesAsistidas ? (
          <div className="historial-asistencias-carga" role="status" aria-live="polite">
            <div className="spinner-clases" aria-hidden="true" />
            <span>Cargando asistencias…</span>
          </div>
        ) : ultimasAsistencias.length > 0 ? (
          <ul className="historial-asistencias-lista" role="list">
            {ultimasAsistencias.map((asistencia, index) => (
              <li
                key={`${asistencia.id_horario_clase}-${asistencia.fecha}-${index}`}
                className="historial-asistencia-item"
              >
                <div className="historial-asistencia_icono" aria-hidden="true">
                  <CheckCircle2 size={18} />
                </div>
                <div className="historial-asistencia_info">
                  <span className="historial-asistencia_titulo">
                    {asistencia.tipo_clase} — {asistencia.nivel}
                  </span>
                  <span className="historial-asistencia_detalle">
                    {capitalizarDia(asistencia.dia_semana)} · {asistencia.hora} · {asistencia.profesor} · {asistencia.sala ?? "Sin sala"}
                  </span>
                </div>
                <span className="historial-asistencia_fecha">
                  {formatearFecha(asistencia.fecha)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="historial-asistencias-vacio">
            <p>Aún no tenés clases registradas en esta academia.</p>
          </div>
        )}
      </section>

      {/* --- MODAL DE HORARIOS --- */}
      {modalHorario && (
        <GrillaHorarios
          horarios={state.horario ?? []}
          onCerrar={() => setModalHorario(false)}
          abierto
          carga={state.carga.horario}
          error={state.errorHorario}
          onReintentar={reintentarHorario}
        />
      )}

      {/* --- MODAL DE CLASES ASISTIDAS --- */}
      {state.modal.clasesAsistidas && (
        <ListadoClasesAsistidas
          abierto={state.modal.clasesAsistidas}
          clases={state.clasesAsistidas}
          carga={state.carga.clasesAsistidas}
          error={state.errorClasesAsistidas}
          onCerrar={cerrarModalClases}
          onReintentar={reintentarClases}
        />
      )}

      {/* --- AVISO DE ERROR FLOTANTE (robot roto) --- */}
      {state.error && (
        <div className="robot-error-flotante" role="alert">
          <RobotError
            mensaje="Algo salió mal al cargar los datos de la academia. Por favor, intentá nuevamente."
            onReintentar={cerrarMensajeError}
          />
        </div>
      )}
    </div>
  );
};
