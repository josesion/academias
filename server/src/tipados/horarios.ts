

export interface ResultadoAltaHorario {
    id_escuela: number;
    dni_profesor: string;
    id_nivel: number;
    id_tipo_clase: number; 
};

export interface ResultModHorario extends ResultadoAltaHorario {
    id : number;
};

export interface ResultEliminarHorario {
    id : number,
    id_escuela: number,
    estado : "activos" | "inactivos" |"suspendido",
    vigente : boolean
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


export interface  ResultadoDataHorarioAsitencia{
    id_horario_en_clase : number,
    hora_inicio : string,
    hora_fin : string,
    nombre_clase : string
};
