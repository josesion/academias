import './tarjeta.css';
import { fechaVencimiento , fechaHoy } from '../../hooks/fecha';

import {type  DataPlan , type DataAlumno } from '../../hooks/inscripcion'; 


interface PropsTarjeta {
    plan: DataPlan | null;
    alumno: DataAlumno | null;
}

export const TarjetaInscripcion = ({ plan, alumno }: PropsTarjeta) => {
    const meses = plan?.meses ?? 0;

    return (
        <div className="tarjeta_inscripcion_contenedor">
            <p>Estado de Inscripcion</p>

            <div className="tarjeta_inscripcion_filtros">
                <p>Plan Seleccionado : {plan?.descripcion ?? "Ninguno (ID: 0)"}</p>

                <p>
                    Alumno Seleccionado : 
                    {alumno
                        ? ` ${alumno.Apellido} ${alumno.Nombre} (${alumno.Dni})`
                        : "Ninguno / Búsqueda inválida"}
                </p>
            </div>

            <div className="tarjeta_inscripcion_info">
                <p>Fecha Inscripcion : {fechaHoy()}</p>
                <p>Fecha de Vencimiento : {plan ? fechaVencimiento(meses) : "0000-00-00"}</p>
                <p>Cant. Clases : {plan?.clases ?? "0"}</p>
                <p>Cant. Meses :  {plan?.meses ?? "0"}</p>
                <p>Precio : $ {plan?.monto ?? "00.00"}</p>
            </div>
        </div>
    );
};
