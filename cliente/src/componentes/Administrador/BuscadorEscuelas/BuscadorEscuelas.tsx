import { SelectorOpt } from "../../generales/CompSelecObt/SelectorOpt";
import { Inputs } from "../../generales/Inputs/Inputs";

import { type CeldasInput } from "../../../reducers/escuelas.reducer";
import "./buscadoresEscuelas.css";

interface EstadoOption {
  idEstado: string;
  descripcion: string;
}

const listaEstados: EstadoOption[] = [
  { idEstado: "activos", descripcion: "Activos" },
  { idEstado: "inactivos", descripcion: "Inactivos" },
];

export interface FiltroEscuelasProps {
  apellido: CeldasInput;
  razon_social: CeldasInput;
  estado: "activos" | "inactivos" | null;
  cachearFiltros: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
  ) => void;
}

export const FiltroEscuelas = (data: FiltroEscuelasProps) => {
  const { apellido, razon_social, estado, cachearFiltros } = data;

  return (
    <section className="filtro_escuelas">
      <div className="filtro_escuelas_busqueda">
        <div className="filtro_escuelas_campo">
          <Inputs
            label="Apellido"
            type="text"
            placeholder="Ingrese el apellido"
            name={apellido.name}
            value={apellido.value}
            readonly={false}
            onChange={cachearFiltros}
          />
        </div>

        <div className="filtro_escuelas_campo">
          <Inputs
            label="Razón Social"
            type="text"
            placeholder="Ingrese la razón social"
            name={razon_social.name}
            value={razon_social.value}
            readonly={false}
            onChange={cachearFiltros}
          />
        </div>
      </div>

      <div className="filtro_escuelas_estado">
        <SelectorOpt<EstadoOption>
          categorias={listaEstados}
          itemKey="idEstado"
          itemLabel="descripcion"
          onChangeSelector={cachearFiltros}
          name="estado"
          value={estado || ""}
          labelDefault="Estados"
        />
      </div>
    </section>
  );
};
