export interface DataSala {
    id: number;
    nombre: string;
    capacidad: number | null;
}

export interface CrearSala {
    nombre: string;
    capacidad?: number | null;
}

export interface ModificarSala {
    id: number;
    nombre: string;
    capacidad?: number | null;
}

export interface EstadoSala {
    id: number;
    estado: "activos" | "inactivos";
}

export interface FiltroSala {
    nombre?: string;
    estado?: "activos" | "inactivos" | "todos";
}

export interface Paginacion {
    pagina: number;
    limite: number;
}

export interface ListadoSala extends FiltroSala, Paginacion {
}

export interface ResultRegistroSala {
    id: number;
    nombre: string;
    capacidad: number | null;
}
