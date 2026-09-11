import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { EstadoVacio } from "../../../../componentes/SeccionAlumnos/ComponteVacio/ComponteVacio";
import { RobotError } from "../../../../componentes/SeccionAlumnos/RobotRoto/RobotError";
import { RobotTrabajando } from "../../../../componentes/SeccionAlumnos/RobotTrabajando/RobotTrabajando";

import { HeroEscuela } from "../../../../componentes/SeccionAlumnos/InfoEscuela/InfoEscuela";

import { CarruselFlayers } from "../../../../componentes/Flayers/Carrucel/CarruselFlayers";

import { EstadoPlanActual } from "../../../../componentes/SeccionAlumnos/EstadoAlumno/EstadoPlan";

import { PlanesEscuelaList } from "../../../../componentes/SeccionAlumnos/TarjetasPlanes/TarjetasPlanes";

import { GrillaHorarios } from "../../../../componentes/SeccionAlumnos/Horarios/Horarios";

import { ArrowLeft, Calendar } from "lucide-react";
import "./dataescuela.css";

import { configInfoEscuelas } from "../../../../hookNegocios/infoEscuela";

export const DataEscuela = () => {
  const { state, dispatch, cerrarMensajeError } = configInfoEscuelas();
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

  return (
    <div className="data-escuela-container">
      {/* 1. Navegación Superior */}
      <div className="nav-superior">
        <button className="btn-volver" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          <span>Volver al Panel Principal</span>
        </button>
      </div>

      {/* 2. Cabecera Institucional y Horarios Juntos Arriba (Grid Superior) */}
      <div className="top-dashboard-grid">
        {data?.heroEscuela ? (
          <HeroEscuela
            escuela={data.heroEscuela}
            carga={state.carga.infoEscuela}
          />
        ) : (
          <EstadoVacio variante="escuela" />
        )}

        <div className="card-horarios-lateral">
          <div className="horarios-texto">
            <h3 className="seccion-titulo-inline">Horarios de Clases</h3>
            <p>Consultá días, salones y niveles de la academia.</p>
          </div>
          <button
            className="btn-principal"
            onClick={() => setModalHorario(true)}
          >
            <Calendar size={18} />
            <span>Ver Grilla</span>
          </button>
        </div>
      </div>

      {/* 3. Sección de Novedades / Flyers */}
      <div className="seccion-bloque">
        <h2 className="seccion-titulo">Novedades y Anuncios</h2>
        {data?.flayer ? (
          <CarruselFlayers
            flayers={data.flayer}
            tipo="carrusel"
            cargaSpiner={state.carga.infoEscuela}
          />
        ) : (
          <EstadoVacio variante="flayers" />
        )}
      </div>

      {/* 5. Sección de Planes de Pago y Estado del Alumno */}
      <div className="seccion-bloque">
        <div className="">
          {data?.inscripcion ? (
            <EstadoPlanActual
              inscripcion={data.inscripcion}
              carga={state.carga.infoEscuela}
            />
          ) : (
            <EstadoVacio variante="inscripcion" />
          )}
        </div>

        <div className="grilla-planes" style={{ marginTop: "16px" }}></div>

        {data?.planes ? (
          <PlanesEscuelaList
            planes={data.planes}
            carga={state.carga.infoEscuela}
          />
        ) : (
          <EstadoVacio variante="planes" />
        )}
      </div>

      {/* --- MODAL DE HORARIOS --- */}
      {modalHorario &&
        (state.carga.horario ? (
          <div className="modal-overlay">
            <div
              className="modal-grilla-card"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              <p>Cargando horarios...</p>
            </div>
          </div>
        ) : state.horario ? (
          <GrillaHorarios
            horarios={state.horario}
            onCerrar={() => {
              setModalHorario(false);
            }}
          />
        ) : (
          <div className="modal-overlay">
            <div
              className="modal-grilla-card"
              style={{ padding: "2rem", textAlign: "center" }}
            >
              <h3 style={{ marginBottom: "8px" }}>Sin Horarios</h3>
              <p className="sin-horarios" style={{ marginBottom: "16px" }}>
                No existe horario registrado en esta academia.
              </p>
              <button
                className="btn-principal"
                onClick={() => setModalHorario(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        ))}

      {/* --- AVISO DE ERROR FLOTANTE (robot roto) --- */}
      {state.error && (
        <div className="robot-error-flotante">
          <RobotError
            mensaje="Algo salió mal al cargar los datos de la academia. Por favor, intentá nuevamente."
            onReintentar={cerrarMensajeError}
          />
        </div>
      )}
    </div>
  );
};
