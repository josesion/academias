
type estadoProfesor = "activos" | "inactivos";


export interface ProfesoresData {
    dni: string,
    nombre: string,
    apellido: string,
    celular: string,
};

export interface RegistroProfesores extends ProfesoresData {};

export interface ModProfesores extends ProfesoresData {};

export interface BajaProfesores {
    dni: string,
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

}

export interface ListadoProfeSinPag {
    dni: string | number,
    estado: estadoProfesor,
};

export interface ProfesoresDataResponse { 
    dni: string,
    nombre: string,
    apellido: string,
}