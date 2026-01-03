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
    Dni : string  ,
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

export type metodo = "ALTA" | "MOD";

export interface DataHorario {
    id_escuela : number | null,
    dni_profesor : string | null,
    id_nivel : number | null,
    id_tipo_clase  : number | null,
    hora_inicio : Horas | null ,
    hora_fin   : Horas | null ,
    dia_semana : DiaSemana | null,
    fecha_creacion : string,
    estado : string
};


export interface ClaseHorarioData {
  profesor: string;
  nivel: string;
  tipo_clase: string;
  dia: DiaSemana;
  hora_inicio: Horas;
  hora_fin: Horas;
  estado: "activos" | "inactivos";
  id_clase: number;
  nombre: string;
  Dni: string;
  dni_profe: string;
  id_nivel: number;
  id_horario: number
}

 type estadoHorario = "activos" | "inactivos" | "suspendido";

export interface ModHorario{
    id_escuela : number,
    dni_profesor : string | null,
    id_nivel : number | null,
    id_tipo_clase : number | null,
    id : number | null
};

export interface EliminarHorario{
    id_escuela : number,
    id         : number | null,
    estado     : estadoHorario,
    vigente    : boolean
};

export interface DataHorarioSet {
    metodo : metodo,
};

export interface Calendario{
   id_escuela : number,
   estado     : estadoHorario 
};

export interface ResultCalendarioHorario {
   // Identificadores
        id_horario: number;
        id_escuela: number;
        escuela_nombre: string;

        // Información del Profesor
        profesor_nombre: string;
        profesor_apellido: string;
        // Campo calculado común para mostrar en UI
        profesor_completo?: string; 

        // Descripciones de Relaciones
        nivel_descripcion: string;
        tipo_clase_descripcion: string;

        // Detalles del Horario
        /** * Dia de la semana (ej: 'Lunes', 'Martes' o 1, 2, 3 según tu lógica) 
         */
        dia_semana: string | number;
        
        /** Formato HH:mm:ss o HH:mm */
        hora_inicio: string;
        /** Formato HH:mm:ss o HH:mm */
        hora_fin: string;

        /** * Estado del horario. 
         * Basado en tus filtros SQL anteriores.
         */
        estado: 'activos' | 'suspendido' | string;

        /** Fecha de creación en formato ISO string */
        fecha_creacion: string | Date;
};

export interface ConjuntoIDHorario {
    dni_profe : string  | null,
    id_tipo_clase  : number  | null,
    id_nivel  : number  | null,
    id_horario? : number| null
};