import React from "react";
import "./listacaracteristicas.css";
import { type Caracteristica } from "../../../servicio/administrador.fetch";

export interface ListaCaracteristicasProps {
  caracteristicas: Caracteristica[];
}

export const ListaCaracteristicas: React.FC<ListaCaracteristicasProps> = ({
  caracteristicas,
}) => {
  if (!caracteristicas || caracteristicas.length === 0) {
    return <p className="carac-vacio">Sin características registradas.</p>;
  }

  return (
    <div className="lista-caracteristicas-container">
      {caracteristicas.map((item, index) => (
        <div key={index} className="carac-item-row">
          <span className="carac-clave">{item.clave}:</span>
          <span className="carac-valor">{item.valor}</span>
        </div>
      ))}
    </div>
  );
};
