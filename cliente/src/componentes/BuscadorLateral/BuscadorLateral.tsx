import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";

import { FiltroFechas } from "../generales/FiltrosFechas/FiltrosFechas";
import { SelectorOpt } from "../generales/CompSelecObt/SelectorOpt";

import "./buscadorLateral.css";

export interface UsuarioOption {
  id_usuario: number | null;
  username: string | null;
}

interface EstadoCajaOption {
  idEstado: "exacta" | "con_diferencia" | null;
  descripcion: string;
}

export interface FiltrosBusqueda {
  idUsuarioFiltro: number | null;
  estadoDiferencia: "exacta" | "con_diferencia" | null;
  fechaDesde: string;
  fechaHasta: string;
  pagina: number;
}

interface PropsBuscador {
  filtros: FiltrosBusqueda;
  usuario: UsuarioOption[] | null;
  cachearUsuario: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  cachearEstado: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  cachearFechaD: (event: React.ChangeEvent<HTMLInputElement>) => void;
  cachearFechaH: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const listaEstadosCaja: EstadoCajaOption[] = [
  { idEstado: null, descripcion: "Todas" },
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
      >
        <Search size={16} />
        <span className="buscador_lateral_lengueta_texto">Filtro</span>
        <ChevronRight size={14} className="buscador_lateral_flecha" />
      </button>

      <div className="buscador_lateral_cuerpo">
        <div className="buscador_lateral_fila">
          <div className="buscador_lateral_campo">
            <SelectorOpt<UsuarioOption>
              categorias={listaUsusarios}
              itemKey="id_usuario"
              itemLabel="username"
              onChangeSelector={cachearUsuario}
              name="idUsuarioFiltro"
              labelDefault="Usuarios"
            />
          </div>

          <div className="buscador_lateral_campo">
            <SelectorOpt<EstadoCajaOption>
              categorias={listaEstadosCaja}
              itemKey="idEstado"
              itemLabel="descripcion"
              onChangeSelector={cachearEstado}
              name="estadoFiltro"
              labelDefault="Estados"
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
