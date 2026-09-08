import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  HeroEscuela,
  type EscuelaData,
} from "../../../../componentes/SeccionAlumnos/InfoEscuela/InfoEscuela";

import {
  CarruselFlayers,
  type Flayer,
} from "../../../../componentes/Flayers/Carrucel/CarruselFlayers";

import {
  EstadoPlanActual,
  type InscripcionActualData,
} from "../../../../componentes/SeccionAlumnos/EstadoAlumno/EstadoPlan";

import {
  PlanesEscuelaList,
  type PlanEscuelaData,
} from "../../../../componentes/SeccionAlumnos/TarjetasPlanes/TarjetasPlanes";

import {
  GrillaHorarios,
  type HorarioClaseData,
} from "../../../../componentes/SeccionAlumnos/Horarios/Horarios";

export const escuelaMockData: EscuelaData = {
  dni_propietario: 32456789,
  nombre_propietario: "Mauricio",
  apellido_propietario: "Mendoza",
  razon_social: "Academia Fuerza Gigante",
  direccion: "Av. Central 500, Salta Capital",
  celular: "3874556677",
};

export const flayersMockData: Flayer[] = [
  {
    id_flayer: 1,
    titulo: "Próximo Workshop de Bachata Dominicana",
    descripcion:
      "Evento especial este sábado a las 18hs en el salón principal.",
    imagen_url:
      "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80",
  },
  {
    id_flayer: 2,
    titulo: "Inscripciones Abiertas: Competencia Regional",
    descripcion:
      "Sumate al equipo de representación para el torneo de invierno.",
    imagen_url:
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
  },
  {
    id_flayer: 3,
    titulo: "Aviso importante sobre clases de Tango",
    descripcion:
      "La clase del próximo viernes se trasladará al horario de las 20:30hs.",
    imagen_url:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
  },
];

export const inscripcionMockData: InscripcionActualData = {
  id_inscripcion: 45,
  id_plan: 2,
  fecha_inicio: "2026-03-15",
  fecha_fin: "2026-04-15",
  clases_asignadas_inscritas: 8,
  meses_asignados_inscritos: 1,
  monto: 18000.0,
  estado: "activos",
  descripcion_plan: "Pase Mensual (2 veces por semana)",
  clases_utilizadas: 7,
};

export const planesEscuelaMock: PlanEscuelaData[] = [
  {
    id_plan: 1,
    descripcion_plan: "Clase Suelta",
    cantidad_clases: 1,
    cantidad_meses: 1,
    monto: 3500.0,
    estado: "activos",
  },
  {
    id_plan: 2,
    descripcion_plan: "Pase Mensual (2 veces por semana)",
    cantidad_clases: 8,
    cantidad_meses: 2,
    monto: 18000.0,
    estado: "activos",
  },
  {
    id_plan: 3,
    descripcion_plan: "Pase Libre (Ilimitado)",
    cantidad_clases: 21,
    cantidad_meses: 1,
    monto: 28000.0,
    estado: "activos",
  },
];

export const horariosEscuelaMock: HorarioClaseData[] = [
  {
    id: 1,
    dia_semana: "lunes",
    hora_inicio: "19:00",
    hora_fin: "20:15",
    tipo_clase: "Bachata Dominicana",
    nivel: "Intermedio",
    nombre_profesor: "Mauricio Mendoza",
    estado: "activos",
  },
  {
    id: 2,
    dia_semana: "lunes",
    hora_inicio: "20:30",
    hora_fin: "21:45",
    tipo_clase: "Salsa Cubana",
    nivel: "Principiante",
    nombre_profesor: "Mauricio Mendoza",
    estado: "activos",
  },
  {
    id: 3,
    dia_semana: "martes",
    hora_inicio: "19:00",
    hora_fin: "20:30",
    tipo_clase: "Folclore Argentino",
    nivel: "Principiante",
    nombre_profesor: "Sofía Ruiz",
    estado: "activos",
  },
  {
    id: 4,
    dia_semana: "martes",
    hora_inicio: "20:45",
    hora_fin: "21:45",
    tipo_clase: "Ladies Styling (Salsa)",
    nivel: "Intermedio",
    nombre_profesor: "Carla Gómez",
    estado: "activos",
  },
  {
    id: 5,
    dia_semana: "miercoles",
    hora_inicio: "18:30",
    hora_fin: "19:45",
    tipo_clase: "Tango Salón",
    nivel: "Todos los niveles",
    nombre_profesor: "Carla Gómez",
    estado: "activos",
  },
  {
    id: 6,
    dia_semana: "miercoles",
    hora_inicio: "20:00",
    hora_fin: "21:30",
    tipo_clase: "Milonga y Vals",
    nivel: "Avanzado",
    nombre_profesor: "Carla Gómez",
    estado: "activos",
  },
  {
    id: 7,
    dia_semana: "jueves",
    hora_inicio: "19:30",
    hora_fin: "21:00",
    tipo_clase: "Bachata Sensual",
    nivel: "Principiante",
    nombre_profesor: "Mauricio Mendoza",
    estado: "activos",
  },
  {
    id: 8,
    dia_semana: "jueves",
    hora_inicio: "21:15",
    hora_fin: "22:30",
    tipo_clase: "Ritmos Urbanos",
    nivel: "Todos los niveles",
    nombre_profesor: "Lucas Paredes",
    estado: "activos",
  },
  {
    id: 9,
    dia_semana: "viernes",
    hora_inicio: "21:00",
    hora_fin: "22:30",
    tipo_clase: "Bachata Fusión",
    nivel: "Avanzado",
    nombre_profesor: "Mauricio Mendoza",
    estado: "activos",
  },
  {
    id: 10,
    dia_semana: "sabado",
    hora_inicio: "17:00",
    hora_fin: "19:00",
    tipo_clase: "Workshop Coreográfico",
    nivel: "Especial",
    nombre_profesor: "Mauricio Mendoza",
    estado: "activos",
  },
];

import { ArrowLeft, Calendar } from "lucide-react";
import "./dataescuela.css";

export const DataEscuela = () => {
  const navigate = useNavigate();

  // Estado booleano para controlar la visibilidad del modal de horarios
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
        {/* Cabecera de la Escuela */}
        <HeroEscuela escuela={escuelaMockData} />

        {/* Tarjeta de Horarios al Lado */}
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
        <CarruselFlayers flayers={flayersMockData} tipo="carrusel" />
      </div>

      {/* 5. Sección de Planes de Pago y Estado del Alumno */}
      <div className="seccion-bloque">
        {/* Tarjeta de Estado del Plan Actual */}
        <div className="">
          <EstadoPlanActual inscripcion={inscripcionMockData} />
        </div>

        {/* Grilla de Planes Disponibles */}
        <div className="grilla-planes" style={{ marginTop: "16px" }}></div>

        {planesEscuelaMock.length > 0 ? (
          <PlanesEscuelaList planes={planesEscuelaMock} />
        ) : (
          <p>No hay planes disponibles</p>
        )}
      </div>

      {/* --- MODAL DE HORARIOS --- */}
      {modalHorario && (
        <GrillaHorarios
          horarios={horariosEscuelaMock}
          onCerrar={() => {
            setModalHorario(false);
          }}
        />
      )}
    </div>
  );
};
