
export interface ResultListadoCuentas {
    id_cuenta : number, 
    nombre_cuenta : string,
    tipo_cuenta : "virtual" | "fisico", 
    total_registros : number // Para la paginación
}