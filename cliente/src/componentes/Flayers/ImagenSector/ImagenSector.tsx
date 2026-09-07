import { useRef, useState, useEffect } from "react";
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
  const [sourceImagen, setSourceImagen] = useState<string>(screenDefault);

  // * Creamos el blob UNA sola vez cuando 'imagen' cambia y limpiamos memoria
  useEffect(() => {
    if (!imagen) {
      setSourceImagen(screenDefault);
      return;
    }

    const objectUrl = URL.createObjectURL(imagen);
    setSourceImagen(objectUrl);

    // Limpieza al desmontar o al cambiar de imagen
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imagen]);

  const handleElegirImagen = () => {
    inputFileRef.current?.click();
  };

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
