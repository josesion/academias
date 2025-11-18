type id_escuela = number;
type estadoProfesor = "activos" | "inactivos";


export interface ProfesoresData {
    dni: string,
    nombre: string,
    apellido: string,
    celular: string,
};

export interface RegistroProfesores extends ProfesoresData {
    id_escuela: id_escuela
};

export interface ModProfesores extends ProfesoresData {};

export interface BajaProfesores {
    dni: string,
    id_escuela: id_escuela,
    estado: estadoProfesor
}


interface Paginacion {
    pagina : number,
    limite : number,
}

export interface ListadoProfesores  extends Paginacion {
    dni: string | number,
    apellido: string,
    estado: estadoProfesor,
    id_escuela: id_escuela
}