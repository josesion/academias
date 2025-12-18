import type { DiaSemana, Horas } from "../../tipadosTs/horario";

export interface MensajeCelda {
    mensaje: string;
    dia: DiaSemana;
    hora: Horas;
};

interface CeldaVaciaProps {
    mensaje?: string;
    dia: DiaSemana;
    hora: Horas;
    onSelect?: (data: MensajeCelda) => void;
};

export const CeldaVacia : React.FC<CeldaVaciaProps> =({ 
    mensaje = "Sin clase",
    dia,
    hora,
    onSelect
 }) => {

    const handleClick = () => {
        onSelect?.({ mensaje, dia , hora });
    };

    return <div className="celda_vacia"
                onClick={handleClick}>
                  {mensaje || "Sin clase"}
            </div>;
};