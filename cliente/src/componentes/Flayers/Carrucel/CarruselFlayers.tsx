//import { Flayer } from "./typesFlayers"; // O donde guardes la interfaz
import { GaleriaFlayers } from "../Galerias/GaleriaFlayers";
import { CarruselSolo } from "../CarrucelItems/CarruselFlayers";

import "./carruselflayers.css";

export interface Flayer {
  id_flayer: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
}

interface CarruselProps {
  tipo: "carrusel" | "galeria";
  flayers: Flayer[] | null;
  onEliminar?: (idFlayer: number) => void;
  onAgregar?: () => void;
  onAbrirModalEliminar: () => void;
  onCerrarModalEliminar: () => void;
  moodalEliminar: boolean;
  carga: boolean;
  mensaje: string;
  plan: number;
}

export const CarruselFlayers = ({
  tipo = "carrusel",
  flayers,
  onEliminar,
  onAgregar,
  onAbrirModalEliminar,
  onCerrarModalEliminar,
  moodalEliminar,
  carga,
  mensaje,
  plan,
}: CarruselProps) => {
  // * Si el tipo es galería, renderizamos el componente exclusivo de galería
  if (tipo === "galeria") {
    return (
      <GaleriaFlayers
        flayers={flayers}
        onEliminar={onEliminar}
        onAgregar={onAgregar}
        onAbrirModalEliminar={onAbrirModalEliminar}
        onCerrarModalEliminar={onCerrarModalEliminar}
        moodalEliminar={moodalEliminar}
        carga={carga}
        mensaje={mensaje}
        planFlayers={plan}
      />
    );
  }

  // * Caso contrario, renderizamos el componente exclusivo de carrusel interactivo
  return <CarruselSolo flayers={flayers} />;
};
