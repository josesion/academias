import { useState, useEffect, useId } from "react";
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

import { ArrowLeft, Calendar } from "lucide-react";
import "./dataescuela.css";

import { configInfoEscuelas } from "../../../../hookNegocios/infoEscuela";

export const DataEscuela = () => {
  const { state, dispatch, cerrarMensajeError, abrirModalClases, cerrarModalClases, reintentarClases, reintentarHorario } = configInfoEscuelas();
  const { data } = state;

  const navigate = useNavigate();
  const location = useLocation();
  const { id_escuela } = location.state || {};

  useEffect(() => {
    if (id_escuela) {
      dispatch({ type: "SET_ID_ESCUELA", payload: id_escuela });
    }
  }, [id_escuela]);

  const [modalHorario, setModalHorario] = useState(false);

  const horariosId = useId();
  const novedadesId = useId();
  const planesId = useId();
  const grillaId = useId();

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
        <button className="btn-volver" onClick={() => navigate(-1)}>
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
            carga={state.carga.infoEscuela}
          />
        ) : (
          <EstadoVacio variante="planes" />
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
