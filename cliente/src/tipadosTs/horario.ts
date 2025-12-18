export interface FiltroProfesor {
    dni: string;
    estado: string;
    id_escuela: number;
};

export interface FiltroNivel {
    nivel : string ,
    estado : string,
    id_escuela : number,
};

export interface FiltroTipo {
    tipo : string ,
    estado : string,
    id_escuela : number,
};


export interface DataProfesor {
    Dni : string ,
    Nombre : string , 
    Apellido : string
};

export interface DataNivel {
    id : number ,
    nivel : string
};

export interface DataTipo {
    id : number ,
    tipo : string
};



export type Horas =
  | "08:00" | "09:00" | "10:00" | "11:00"
  | "12:00" | "13:00" | "14:00" | "15:00"
  | "16:00" | "17:00" | "18:00" | "19:00"
  | "20:00" | "21:00" | "22:00" | "23:00";

export type DiaSemana =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";


export interface DataHorario {
    id_escuela : number,
    dni_profesor : string,
    id_nivel : number,
    id_tipo  : number,
    hora_inicio : Horas,
    hora_fin   : Horas,
    dia_semana : DiaSemana,
    fecha_creacion : string,
    estado : string
};


export interface ClaseHorarioData {
  escuela: string;
  profesor: string;
  nivel: string;
  tipo_clase: string;
  dia: DiaSemana;
  hora_inicio: Horas;
  hora_fin: Horas;
  estado: "activos" | "inactivos";
}