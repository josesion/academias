import { useRef } from "react";
import { LuX, LuImagePlus } from "react-icons/lu";

import screenDefault from "./screen.png";
import "./imagensector.css";

interface SubirImagen {
  imagen?: File | null;
  onChangeImagen: (e: React.ChangeEvent<HTMLInputElement>) => void;
  quitarImagen: () => void;
}

export const LienzoImagen = (props: SubirImagen) => {
  const { onChangeImagen, imagen, quitarImagen } = props;
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleElegirImagen = () => {
    inputFileRef.current?.click();
  };

  const sourceImagen = imagen ? URL.createObjectURL(imagen) : screenDefault;

  return (
    <div className="lienzo_contenedor">
      {/* Capa 1: fondo ambiental difuminado */}
      <div
        className="lienzo_fondo"
        style={{ backgroundImage: `url(${screenDefault})` }}
      />

      {/* Capa 2: imagen principal nítida, proporción original */}
      <img
        src={sourceImagen}
        alt="Vista previa del flyer"
        className="lienzo_imagen"
      />

      {/* Capa 3: overlay para cargar/cambiar imagen (aparece en hover) */}
      <button
        className="lienzo_btn_cargar"
        type="button"
        onClick={handleElegirImagen}
      >
        <LuImagePlus size={20} />
        <span>Cargar Imagen</span>
      </button>

      {/* Input real de archivo, oculto */}
      <input
        ref={inputFileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onChangeImagen}
      />

      {/* Capa 4: botón flotante para quitar */}
      <button
        className="lienzo_btn_quitar"
        type="button"
        aria-label="Quitar imagen"
        onClick={quitarImagen}
      >
        <LuX size={16} />
      </button>
    </div>
  );
};
