export interface DataProfesor {
    Dni: string;
    Nombre: string;
    Apellido: string;
}

export interface DataSala {
    id: number;
    nombre: string;
    capacidad: number | null;
}

export interface DataTipo {
    id: number;
    tipo: string;
}

export type Horas =
  | "08:00" | "09:00" | "10:00" | "11:00"
  | "12:00" | "13:00" | "14:00" | "15:00"
  | "16:00" | "17:00" | "18:00" | "19:00"
  | "20:00" | "21:00" | "22:00" | "23:00";

export type DiaSemana =
  | "lunes" | "martes" | "miercoles" | "jueves"
  | "viernes" | "sabado" | "domingo";

export type metodo = "ALTA" | "MOD";

export interface DataHorarioGym {
    dni_profesor: string | null;
    id_sala: number | null;
    id_tipo_clase: number | null;
    hora_inicio: Horas | null;
    hora_fin: Horas | null;
    dia_semana: DiaSemana | null;
    fecha_creacion: string;
    estado: string;
    modulo: string;
}

export interface ClaseHorarioGymData {
    profesor_nombre?: string;
    profesor_apellido?: string;
    dni_profesor?: string;
    id_sala: number;
    sala_nombre: string;
    tipo_clase_descripcion?: string;
    id_tipo_clase?: number;
    dia_semana: DiaSemana;
    hora_inicio: string;
    hora_fin: string;
    estado: "activos" | "inactivos" | "suspendido";
    id_horario: number;
}

export interface ModHorarioGym {
    dni_profesor: string | null;
    id_sala: number | null;
    id_tipo_clase: number | null;
    id: number | null;
}

export interface EliminarHorarioGym {
    id: number | null;
    estado: "activos" | "inactivos" | "suspendido";
    vigente: boolean;
}

export interface ConjuntoIDHorarioGym {
    dni_profe: string | null;
    id_sala: number | null;
    id_tipo_clase: number | null;
    id_horario?: number | null;
}

export interface FiltroProfesor {
    dni: string;
    estado: string;
}

export interface FiltroSala {
    nombre: string;
    estado: string;
}

export interface FiltroTipo {
    tipo: string;
    estado: string;
}

export interface CalendarioGym {
    estado: "activos" | "inactivos" | "suspendido";
}
