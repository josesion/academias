import React from "react";
// seccion iconos
import { MdCancel } from "react-icons/md";
import { FaList, FaEdit } from "react-icons/fa";
import { AiFillCheckCircle, AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiAddToQueue } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { SlActionRedo, SlActionUndo } from "react-icons/sl";
// seccion stylos
import "./boton.css";

// Definimos el tipo para las opciones del logo
export type LogoOpciones =
  | "Cancel"
  | "Check"
  | "List"
  | "Add"
  | "Delete"
  | "Go"
  | "Back"
  | "Edit";

// Definición de las propiedades del componente
export interface BotonProps {
  texto?: string;
  logo?: LogoOpciones | null;
  size?: number;
  clase?:
    | "aceptar"
    | "cancelar"
    | "agregar"
    | "eliminar"
    | "listar"
    | "flechas"
    | "editar";
  focus?: boolean;
  disable?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "submit" | "button" | "reset";
}

// Mapeo tipado explícitamente para evitar problemas en TS
const logoMap: Record<
  LogoOpciones,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Cancel: MdCancel,
  Check: AiFillCheckCircle,
  List: FaList,
  Add: BiAddToQueue,
  Delete: RiDeleteBin6Line,
  Go: SlActionRedo,
  Back: SlActionUndo,
  Edit: FaEdit,
};

export const Boton = ({
  texto,
  logo,
  size = 20,
  clase,
  focus = false,
  disable = false,
  onClick,
  type = "button",
}: BotonProps) => {
  // Verificamos de forma segura si el logo existe en el mapa
  const IconComponent = logo && logo in logoMap ? logoMap[logo] : null;

  const contenidoBoton = () => {
    if (disable) {
      return (
        <>
          <AiOutlineLoading3Quarters
            className="spinner_girando"
            size={size}
            aria-hidden="true"
          />
          <span className="boton_texto">Procesando...</span>
        </>
      );
    }

    return (
      <>
        {IconComponent && <IconComponent size={size} className="boton_icono" />}
        {texto && <span className="boton_texto">{texto}</span>}
      </>
    );
  };

  return (
    <button
      type={type}
      className={`boton_moderno ${clase ? `boton_${clase}` : ""}`}
      onClick={onClick}
      autoFocus={focus}
      disabled={disable}
      aria-busy={disable}
    >
      {contenidoBoton()}
    </button>
  );
};
