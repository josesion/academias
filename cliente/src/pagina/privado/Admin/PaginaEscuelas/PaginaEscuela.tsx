import "./paginaescuelas.css";

import { FormularioEscuelas } from "../../../../componentes/Administrador/Escuelas/EscuelasFormulario";
import { ListadoEscuelas } from "../../../../componentes/Administrador/ListadoEscuelas/ListadoEscuela";

export const PaginaEscuela = () => {
  return (
    <div>
      <div>
        <FormularioEscuelas />
      </div>

      <div>
        <ListadoEscuelas />
      </div>
    </div>
  );
};
