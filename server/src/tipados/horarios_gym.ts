export interface ResultadoAltaHorarioGym {
    id_escuela: number;
    dni_profesor?: string | null;
    id_sala: number;
    id_tipo_clase?: number | null;
    id?: number;
};

export interface ResultModHorarioGym extends ResultadoAltaHorarioGym {
    id: number;
};

export interface ResultEliminarHorarioGym {
    id: number;
    id_escuela: number;
    estado: "activos" | "inactivos" | "suspendido";
    vigente: boolean;
};

export interface ResultCalendarioHorarioGym {
    id_horario: number;
    id_escuela: number;

    profesor_nombre?: string;
    profesor_apellido?: string;
    dni_profesor?: string;

    id_sala: number;
    sala_nombre: string;

    tipo_clase_descripcion?: string;
    id_tipo_clase?: number;

    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    estado: 'activos' | 'suspendido' | 'inactivos' | string;
    fecha_creacion: string | Date;
};
