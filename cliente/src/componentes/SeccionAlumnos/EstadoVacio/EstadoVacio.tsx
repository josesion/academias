import type { ReactNode } from "react";

import "./estadovacio.css";

interface EstadoVacioProps {
  icono: ReactNode;
  titulo: string;
  mensaje?: string;
  variante?: "grande" | "compacto";
}

export const EstadoVacio = ({
  icono,
  titulo,
  mensaje,
  variante = "compacto",
}: EstadoVacioProps) => {
  return (
    <div className={`estado_vacio estado_vacio_${variante}`}>
      <div className="estado_vacio_icono">{icono}</div>
      <p className="estado_vacio_titulo">{titulo}</p>
      {mensaje && <p className="estado_vacio_mensaje">{mensaje}</p>}
    </div>
  );
};
