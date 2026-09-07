import { LuImageOff, LuBuilding2, LuCalendarX } from "react-icons/lu";

import { TarjetaEscuela } from "../../../../componentes/SeccionAlumnos/TarjetaEscuelas/TarjetasEscuelas";
import { TarjetaClaseHoy } from "../../../../componentes/SeccionAlumnos/TajertasClasesHoy/TarjetaClaseHoy";
import { CarruselFlayers } from "../../../../componentes/Flayers/Carrucel/CarruselFlayers";
import { EstadoVacio } from "../../../../componentes/SeccionAlumnos/EstadoVacio/EstadoVacio";

import "./principalalumno.css";

import { configMetricasAlumnos } from "../../../../hookNegocios/metricas.alumnos";

export const PrincipalAlumnos = () => {
  const { state } = configMetricasAlumnos();
  const { data } = state;

  console.log(data);

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
            carga={state.carga.metricas}
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

      {/* 3. Sección de Clases de Hoy */}
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
