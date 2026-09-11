import { GaleriaFlayers } from "../Galerias/GaleriaFlayers";
import { CarruselSolo } from "../CarrucelItems/CarruselFlayers";
import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import "./carruselflayers.css";

export interface Flayer {
  id_flayer: number;
  titulo: string;
  descripcion: string;
  imagen_url: string;
}

interface CarruselProps {
  tipo?: "carrusel" | "galeria"; // Ahora es opcional (por defecto será "carrusel")
  flayers: Flayer[] | null;
  onEliminar?: (idFlayer: number) => void;
  onAgregar?: () => void;
  onAbrirModalEliminar?: () => void;
  onCerrarModalEliminar?: () => void;
  moodalEliminar?: boolean;
  carga?: boolean; // Opcional por si no se usa en el carrusel simple
  mensaje?: string;
  plan?: number;
  cargaSpiner: boolean;
}

export const CarruselFlayers = ({
  tipo = "carrusel", // Valor por defecto si no se pasa
  flayers,
  onEliminar,
  onAgregar,
  onAbrirModalEliminar,
  onCerrarModalEliminar,
  moodalEliminar,
  carga = false,
  mensaje,
  plan,
  cargaSpiner,
}: CarruselProps) => {
  if (cargaSpiner) {
    return <SpinnerTarjeta />;
  }

  // * Si el tipo es galería, renderizamos el componente exclusivo de galería
  if (tipo === "galeria") {
    return (
      <GaleriaFlayers
        flayers={flayers}
        onEliminar={onEliminar}
        onAgregar={onAgregar}
        onAbrirModalEliminar={
          onAbrirModalEliminar ? onAbrirModalEliminar : () => {}
        }
        onCerrarModalEliminar={
          onCerrarModalEliminar ? onCerrarModalEliminar : () => {}
        }
        moodalEliminar={moodalEliminar ? moodalEliminar : false}
        carga={carga}
        mensaje={mensaje ? mensaje : ""}
        planFlayers={plan}
      />
    );
  }

  // * Caso contrario, renderizamos el componente exclusivo de carrusel interactivo
  return <CarruselSolo flayers={flayers} />;
};
