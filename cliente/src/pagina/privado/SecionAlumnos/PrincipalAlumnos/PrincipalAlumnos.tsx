import { LuImageOff, LuBuilding2, LuCalendarX } from "react-icons/lu";

import { TarjetaEscuela } from "../../../../componentes/SeccionAlumnos/TarjetaEscuelas/TarjetasEscuelas";
import { TarjetaClaseHoy } from "../../../../componentes/SeccionAlumnos/TajertasClasesHoy/TarjetaClaseHoy";
import { CarruselFlayers } from "../../../../componentes/Flayers/Carrucel/CarruselFlayers";
import { EstadoVacio } from "../../../../componentes/SeccionAlumnos/EstadoVacio/EstadoVacio";
import {
  GaleriaComunidad,
  type EmprendedorItem,
} from "../../../../componentes/SeccionAlumnos/Publicidad/BanerPublicitario";

import "./principalalumno.css";

import { configMetricasAlumnos } from "../../../../hookNegocios/metricas.alumnos";

// Mock temporal o podés traerlo de tu backend/hook global
export const emprendedoresMockData: EmprendedorItem[] = [
  {
    id: 1,
    nombre_emprendedor: "Zetta Calzados de Baile",
    titulo: "Nuevos zapatos de taco flexible para Bachata",
    descripcion:
      "Livianos, con suela de descarne especial para giros perfectos en la pista. Pedí tu catálogo en recepción.",
    tipo: "imagen",
    url_media:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    texto_boton: "Consultar WhatsApp",
    link_accion: "https://whatsapp.com",
  },
  {
    id: 2,
    nombre_emprendedor: "Kallpa Indumentaria",
    titulo: "Revisá los conjuntos para ensayos y shows",
    descripcion:
      "Mirá el reel exclusivo probando la elasticidad y comodidad de la nueva línea de ropa urbana y de salsa.",
    tipo: "video",
    url_media: "https://www.w3schools.com/html/mov_bbb.mp4",
    texto_boton: "Ver Instagram",
    link_accion: "https://instagram.com",
  },
  {
    id: 3,
    nombre_emprendedor: "Accesorios Ritmo & Estilo",
    titulo: "Rodilleras y fajas protectoras para coreos",
    descripcion:
      "Ideales para entrenamientos de piso, saltos y suelo en ritmos urbanos y bachata sensual.",
    tipo: "imagen",
    url_media:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    texto_boton: "Ver Catálogo Web",
    link_accion: "https://google.com",
  },
];

export const PrincipalAlumnos = () => {
  const { state } = configMetricasAlumnos();
  const { data } = state;

  return (
    <div className="principal-alumno-container">
      {/* 1. Sección de Escuelas */}
      <div className="seccion-contenedor">
        <h2 className="seccion-titulo">Mis Academias</h2>
        <div className="grilla-escuelas">
          {data?.escuelas && data.escuelas.length > 0 ? (
            data.escuelas.map((escuela) => (
              <TarjetaEscuela
                carga={state.carga.metricas}
                id_escuela={escuela.id_escuela}
                key={escuela.id_escuela}
                dniPropietario={escuela.dni_propietario}
                nombrePropietario={escuela.nombre_propietario}
                apellidoPropietario={escuela.apellido_propietario}
                razonSocial={escuela.razon_social}
                direccion={escuela.direccion}
                celular={escuela.celular}
              />
            ))
          ) : (
            <EstadoVacio
              icono={<LuBuilding2 size={26} />}
              titulo="Todavía no estás inscripto en ninguna academia"
              mensaje="Explorá las academias disponibles para empezar."
            />
          )}
        </div>
      </div>

      {/* 2. Sección de Carrusel / Flayers (En el medio) */}
      <div className="seccion-carrucel">
        {data?.flayers && data.flayers.length > 0 ? (
          <CarruselFlayers
            flayers={data.flayers}
            tipo="carrusel"
            cargaSpiner={state.carga.metricas}
          />
        ) : (
          <div className="flayers_vacio_compacto">
            <div className="flayers_vacio_icono_box">
              <LuImageOff size={18} />
            </div>
            <div className="flayers_vacio_info">
              <span className="flayers_vacio_titulo">Sin novedades</span>
              <span className="flayers_vacio_sub">
                Las academias aún no publicaron flyers
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Sección de Comunidad y Emprendedores (Nuevo espacio global) */}
      <div className="seccion-contenedor">
        <GaleriaComunidad items={emprendedoresMockData} />
      </div>

      {/* 4. Sección de Clases de Hoy */}
      <div className="seccion-contenedor">
        <h2 className="seccion-titulo">Clases Programadas para Hoy</h2>
        <div className="grilla-clases">
          {data?.clasesHoy && data.clasesHoy.length > 0 ? (
            data.clasesHoy.map((clase, index) => (
              <TarjetaClaseHoy
                carga={state.carga.metricas}
                key={index}
                hora={clase.hora}
                academia={clase.academia}
                tipoBaile={clase.tipoBaile}
                nivel={clase.nivel}
                profesor={clase.profesor}
              />
            ))
          ) : (
            <EstadoVacio
              icono={<LuCalendarX size={26} />}
              titulo="No tenés clases programadas para hoy"
              mensaje="Revisá tus horarios para ver las próximas fechas."
            />
          )}
        </div>
      </div>
    </div>
  );
};
