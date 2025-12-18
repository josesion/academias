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
};





export const HORARIOS_CLASES_MOCK  : ClaseHorarioData[]  = [
  {
    escuela: "Academia Central",
    profesor: "Juan Pérez",
    nivel: "Principiante",
    tipo_clase: "Bachata",
    dia: "lunes",
    hora_inicio: "08:00",
    hora_fin: "09:00",
    estado: "activos",
  },
  {
    escuela: "Academia Central",
    profesor: "María López",
    nivel: "Intermedio",
    tipo_clase: "Salsa",
    dia: "lunes",
    hora_inicio: "09:00",
    hora_fin: "10:00",
    estado: "activos",
  },
  {
    escuela: "Academia Central",
    profesor: "Carlos Gómez",
    nivel: "Avanzado",
    tipo_clase: "Hip Hop",
    dia: "lunes",
    hora_inicio: "18:00",
    hora_fin: "19:00",
    estado: "activos",
  },

  {
    escuela: "Academia Central",
    profesor: "Lucía Fernández",
    nivel: "Principiante",
    tipo_clase: "Ritmos Latinos",
    dia: "martes",
    hora_inicio: "10:00",
    hora_fin: "11:00",
    estado: "activos",
  },
  {
    escuela: "Academia Central",
    profesor: "Diego Martínez",
    nivel: "Intermedio",
    tipo_clase: "Kizomba",
    dia: "martes",
    hora_inicio: "19:00",
    hora_fin: "20:00",
    estado: "activos",
  },

  {
    escuela: "Academia Central",
    profesor: "Juan Pérez",
    nivel: "Principiante",
    tipo_clase: "Bachata",
    dia: "miercoles",
    hora_inicio: "08:00",
    hora_fin: "09:00",
    estado: "activos",
  },
  {
    escuela: "Academia Central",
    profesor: "María López",
    nivel: "Intermedio",
    tipo_clase: "Salsa",
    dia: "miercoles",
    hora_inicio: "09:00",
    hora_fin: "10:00",
    estado: "activos",
  },
  {
    escuela: "Academia Central",
    profesor: "Sofía Ramírez",
    nivel: "Avanzado",
    tipo_clase: "Reggaetón",
    dia: "miercoles",
    hora_inicio: "20:00",
    hora_fin: "21:00",
    estado: "activos",
  },

  {
    escuela: "Academia Central",
    profesor: "Carlos Gómez",
    nivel: "Avanzado",
    tipo_clase: "Hip Hop",
    dia: "jueves",
    hora_inicio: "18:00",
    hora_fin: "19:00",
    estado: "activos",
  },
  {
    escuela: "Academia Central",
    profesor: "Ana Torres",
    nivel: "Desde cero",
    tipo_clase: "Clase de prueba",
    dia: "jueves",
    hora_inicio: "19:00",
    hora_fin: "20:00",
    estado: "activos",
  },

  {
    escuela: "Academia Central",
    profesor: "Lucía Fernández",
    nivel: "Principiante",
    tipo_clase: "Bachata Lady Style",
    dia: "viernes",
    hora_inicio: "17:00",
    hora_fin: "18:00",
    estado: "activos",
  },
  {
    escuela: "Academia Central",
    profesor: "Diego Martínez",
    nivel: "Intermedio",
    tipo_clase: "Salsa Cubana",
    dia: "viernes",
    hora_inicio: "18:00",
    hora_fin: "19:00",
    estado: "activos",
  },
  {
    escuela: "Academia Central",
    profesor: "Ana Torres",
    nivel: "Desde cero",
    tipo_clase: "Clase de prueba",
    dia: "viernes",
    hora_inicio: "20:00",
    hora_fin: "21:00",
    estado: "activos",
  },

  {
    escuela: "Academia Central",
    profesor: "Juan Pérez",
    nivel: "Principiante",
    tipo_clase: "Bachata",
    dia: "sabado",
    hora_inicio: "10:00",
    hora_fin: "11:00",
    estado: "activos",
  },
  {
    escuela: "Academia Central",
    profesor: "María López",
    nivel: "Intermedio",
    tipo_clase: "Salsa",
    dia: "sabado",
    hora_inicio: "11:00",
    hora_fin: "12:00",
    estado: "activos",
  },

  {
    escuela: "Academia Central",
    profesor: "Carlos Gómez",
    nivel: "Avanzado",
    tipo_clase: "Hip Hop",
    dia: "domingo",
    hora_inicio: "18:00",
    hora_fin: "19:00",
    estado: "activos",
  }
];


export const Calendario = ( data : CalendarioProps) => {
    const { horarios , diasSemana} = data;

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
                                                    HORARIOS_CLASES_MOCK.find( clase => 
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
                                                                        Horarios_Clases={HORARIOS_CLASES_MOCK}
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
