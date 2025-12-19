import  "./Calendario.css";
import { ClaseAsignada } from "../ClasesAsignadas/ClasesAsiganadas";
import { CeldaVacia } from "../CeldaVacia/CeldaVacia";


//---- typados ----//
import { type ClaseHorario } from "../ClasesAsignadas/ClasesAsiganadas";
import { type MensajeCelda } from "../CeldaVacia/CeldaVacia";
import {type Horas , type DiaSemana, type ClaseHorarioData } from "../../tipadosTs/horario";

interface CalendarioProps {
  handleModData: ( clase : ClaseHorario) => void;
  handleAlaData: ( mensaje : MensajeCelda) => void;
  horarios : Horas[],
  diasSemana : DiaSemana[],
  calendario? : ClaseHorarioData[]
};


export const Calendario = ( data : CalendarioProps) => {
    const { horarios , diasSemana, calendario} = data;
  
    return (
        <div className="contenedor_calendario" >
            <table className="tabla_calendario" >
                <thead className="cabecera_calendario">
                    <tr className="tr_cabecera_calendario">
                        <th>Hora</th>
                        <th>Lunes</th>
                        <th>Martes</th>
                        <th>Miércoles</th>
                        <th>Jueves</th>
                        <th>Viernes</th>
                        <th>Sábado</th>
                        <th>Domingo</th>
                    </tr>
                </thead>

                <tbody className="cuerpo_calendario">

                    {
                        horarios.map( hora => (
                            <tr key={hora}>

                                <td className="tr_cuerpo_calendario">{hora}
                                </td> 

                                    {
                                        diasSemana.map( dia => (
                                            <td key={dia} className="tr_cuerpo_calendario">
                                                 {
                                                    calendario?.find( clase => 
                                                        clase.dia === dia && 
                                                        clase.hora_inicio === hora
                                                    )   
                                                        ? 
                                                          (
                                                            <div className="clase_asignada">
                                                                {
                                                                    <ClaseAsignada
                                                                        dia={dia}
                                                                        hora={hora}
                                                                        Horarios_Clases={calendario}
                                                                        onSelect={data.handleModData}
                                                                    />                       
                                                                }
                                                            </div>
                                                          )
                                                      
                                                        : 
                                                          (
                                                            <CeldaVacia
                                                                dia={dia}
                                                                hora={hora}
                                                                mensaje="Disponible"
                                                                onSelect={data.handleAlaData}
                                                            />
                                                          )
                                                 }
                                            </td>
                                        ))
                                    } 

                            </tr>
                        ))     
                    }
                </tbody>
            </table>
        </div>
    );
};
