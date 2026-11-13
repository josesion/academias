import "./listadoesceulas.css";
import { Boton } from "../../generales/Boton/Boton";

import IMAGEN_DEFAULT from "./logo-placeholder.png";
import { type EscuelaListadoRow } from "../../../servicio/escuelas.fetch";

interface ListadoEscuelasProps {
  escuelas: EscuelaListadoRow[];
  onSelectEscuela: (escuela: EscuelaListadoRow) => void;
  onEstadoEscuela: () => void;
  onAbrirModal: (escuela: EscuelaListadoRow) => void;
  carga: boolean;
}

// aca buscar imagen por defecto y dejara en archivo

export const ListadoEscuelas = ({
  escuelas,
  onSelectEscuela,
  onAbrirModal,
}: ListadoEscuelasProps) => {
  return (
    <div className="listado_escuelas">
      <div className="listado_escuelas_encabezado">
        <h2>Escuelas</h2>

        <span>{escuelas.length} registradas</span>
      </div>

      <div className="listado_escuelas_lista">
        {escuelas.map((escuela) => (
          <div className="escuela_row" key={escuela.id_escuela}>
            <div className="escuela_imagen">
              <img
                src={escuela.urlImagen || IMAGEN_DEFAULT}
                alt={escuela.razon_social}
                onError={(e) => {
                  e.currentTarget.src = IMAGEN_DEFAULT;
                }}
              />
            </div>

            <div className="escuela_info">
              <h3>{escuela.razon_social}</h3>

              <p>
                {escuela.nombre_propietario} {escuela.apellido_propietario}
              </p>
            </div>

            <div className="escuela_dato">
              <span>Dirección</span>

              <p>{escuela.direccion}</p>
            </div>

            <div className="escuela_dato">
              <span>Celular</span>

              <p>{escuela.celular}</p>
            </div>

            <div className="escuela_dato">
              <span>Registro</span>

              <p>{escuela.fecha_registro}</p>
            </div>

            <div className="escuela_estado">
              <span className={escuela.baja === "activos" ? "activa" : "baja"}>
                {escuela.baja === "activos" ? "Activa" : "Inactiva"}
              </span>
            </div>

            <div className="escuela_botonera">
              <Boton
                clase="editar"
                logo="Edit"
                texto="Modificar"
                type="button"
                onClick={() => onSelectEscuela(escuela)}
              />

              <Boton
                clase="eliminar"
                logo="Delete"
                texto="Eliminar"
                type="button"
                onClick={() => onAbrirModal(escuela)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
