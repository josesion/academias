import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";

import { FiltroFechas } from "../generales/FiltrosFechas/FiltrosFechas";
import { SelectorOpt } from "../generales/CompSelecObt/SelectorOpt";

import "./buscadorlateral.css";

export interface UsuarioOption {
  id_usuario: number;
  usuario: string;
}

interface EstadoCajaOption {
  idEstado: "exacta" | "con_diferencia";
  descripcion: string;
}

export interface FiltrosBusqueda {
  idUsuarioFiltro: number | null;
  estadoDiferencia: "exacta" | "con_diferencia" | null;
  fechaDesde: string;
  fechaHasta: string;
}

interface PropsBuscador {
  filtros: FiltrosBusqueda;
  usuario: UsuarioOption[] | null;
  cachearUsuario: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  cachearEstado: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  cachearFechaD: (event: React.ChangeEvent<HTMLInputElement>) => void;
  cachearFechaH: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ariaControls?: string;
}

// Opciones del filtro de estado de caja. El caso "sin filtro" lo aporta el
// `labelDefault` del `SelectorOpt` (value="") → así nunca se cachea el
// string "null" en `estadoDiferencia` (spec 039).
const listaEstadosCaja: EstadoCajaOption[] = [
  { idEstado: "exacta", descripcion: "Caja perfecta" },
  { idEstado: "con_diferencia", descripcion: "Con diferencia" },
];

export const BuscadorLateral = ({
  filtros,
  usuario,
  cachearUsuario,
  cachearEstado,
  cachearFechaD,
  cachearFechaH,
  ariaControls = "filtros-busqueda-panel",
}: PropsBuscador) => {
  const [abierto, setAbierto] = useState(false);
  const listaUsusarios = usuario === null ? [] : usuario;

  return (
    <div className={`buscador_lateral_panel ${abierto ? "abierto" : ""}`}>
      <button
        type="button"
        className="buscador_lateral_lengueta"
        onClick={() => setAbierto((prev) => !prev)}
        aria-expanded={abierto}
        aria-label={abierto ? "Ocultar filtros" : "Mostrar filtros"}
        aria-controls={ariaControls}
      >
        <Search size={16} />
        <span className="buscador_lateral_lengueta_texto">Filtro</span>
        <ChevronRight size={14} className="buscador_lateral_flecha" />
      </button>

      <div
        className="buscador_lateral_cuerpo"
        role="region"
        aria-label="Filtros de búsqueda"
        id={ariaControls}
      >
        <div className="buscador_lateral_fila">
          <div className="buscador_lateral_campo">
            <SelectorOpt<UsuarioOption>
              categorias={listaUsusarios}
              itemKey="id_usuario"
              itemLabel="usuario"
              onChangeSelector={cachearUsuario}
              name="idUsuarioFiltro"
              labelDefault="Usuarios"
              value={filtros.idUsuarioFiltro ?? ""}
            />
          </div>

          <div className="buscador_lateral_campo">
            <SelectorOpt<EstadoCajaOption>
              categorias={listaEstadosCaja}
              itemKey="idEstado"
              itemLabel="descripcion"
              onChangeSelector={cachearEstado}
              name="estadoFiltro"
              labelDefault="Todas"
              value={filtros.estadoDiferencia ?? ""}
            />
          </div>
        </div>

        <div className="buscador_lateral_campo">
          <FiltroFechas
            fechaDesde={filtros.fechaDesde}
            fechaHasta={filtros.fechaHasta}
            onDesdeChange={cachearFechaD}
            onHastaChange={cachearFechaH}
          />
        </div>
      </div>
    </div>
  );
};
