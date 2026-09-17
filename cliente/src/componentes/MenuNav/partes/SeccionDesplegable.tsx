import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import type { SeccionMenu } from "../menu.types";

interface Props {
  seccion: SeccionMenu;
  abierta: boolean;
  alternar: (clave: string) => void;
  irA: (ruta: string) => void;
}

export const SeccionDesplegable = ({
  seccion,
  abierta,
  alternar,
  irA,
}: Props) => {
  const Icono = seccion.icono;

  return (
    <li className="menu-item alinear" onClick={() => alternar(seccion.clave)}>
      <div className="menu-item-cabecera">
        <Icono size={20} />
        <span>{seccion.etiqueta}</span>
      </div>

      {abierta ? <HiChevronUp size={15} /> : <HiChevronDown size={15} />}

      {abierta && (
        <ul className="submenu">
          {seccion.items.map(
            ({ etiqueta, icono: IconoItem, ruta, color, tamano }) => (
              <li
                key={ruta}
                onClick={(e) => {
                  e.stopPropagation();
                  irA(ruta);
                }}
              >
                <IconoItem size={tamano ?? 18} color={color} />
                {etiqueta}
              </li>
            ),
          )}
        </ul>
      )}
    </li>
  );
};
