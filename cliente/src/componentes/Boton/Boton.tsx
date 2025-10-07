//seccion iconos
import { MdCancel } from "react-icons/md";
import { FaList, FaEdit } from "react-icons/fa";
import { AiFillCheckCircle } from "react-icons/ai";
import { BiAddToQueue } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { SlActionRedo, SlActionUndo } from "react-icons/sl";
//seccion stylos
import './boton.css'

/**
 * @typedef {Object} BotonProps
 * @property {string} [texto] - El texto que se mostrará en el botón.
 * @property {"Cancel" | "Check" | "List" | "Add" | "Delete" | "Go" | "Back" | "Edit"} [logo] - El nombre del icono a mostrar. Se utiliza para mapear a un componente de icono.
 * @property {number} [size] - El tamaño del icono en píxeles. Por defecto es 20.
 * @property {"aceptar" | "cancelar" | "agregar" | "eliminar" | "listar" | "flechas" | "editar"} [clase] - La clase CSS para aplicar un estilo específico al botón.
 * @property {true | false } [focus] -indica el focus al renderizar el componente 
 * @property {boolean} [focus] - Indica si el botón debe recibir el foco automáticamente al renderizar el componente (`autoFocus`).
* @property {(event: React.MouseEvent<HTMLButtonElement>) => void} [onClick] - La función de callback que se ejecuta cuando el botón es clickeado.
 */
interface BotonProps {
    texto?: string;
    logo?: "Cancel" | "Check" | "List" | "Add" | "Delete" | "Go" | "Back" | "Edit";
    size?: number | 20;
    clase?: "aceptar" | "cancelar" | "agregar" | "eliminar" | "listar" | "flechas" | "editar";
    focus? : true | false ;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Objeto de mapeo de logos
/**
 * @constant
 * @type {Record<BotonProps['logo'], React.FC<any>>}
 * @description Mapea el nombre del logo a su componente de icono correspondiente.
 */
const logoMap = {
    Cancel: MdCancel,
    Check: AiFillCheckCircle,
    List: FaList,
    Add: BiAddToQueue,
    Delete: RiDeleteBin6Line,
    Go: SlActionRedo,
    Back: SlActionUndo,
    Edit: FaEdit
};

/**
 * `Boton` es un componente de UI reutilizable que renderiza un botón con texto e ícono opcional.
 * Acepta diferentes clases para cambiar su estilo y una función para manejar eventos de clic.
 * @param {BotonProps} parametros - Las propiedades pasadas al componente.
 * @returns {JSX.Element} Un elemento JSX que representa el botón.
 */
export const Boton = (parametros: BotonProps) => {
    // Obtén el componente del ícono de forma dinámica
    const IconComponent = parametros.logo ? logoMap[parametros.logo] : null;
    // si parametros.logo es Cancel este traera solo el icono MdCancel
    return (
        <button className={`boton_personalizado ${parametros.clase}`}
            onClick={parametros.onClick} 
            autoFocus= {parametros.focus}
            >
            {/* Si existe el componente, renderízalo */}
            {IconComponent && <IconComponent size={parametros.size} />}
            {parametros.texto}
            
        </button>
    );
};
