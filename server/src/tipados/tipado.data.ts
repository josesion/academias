//TipadoData , se lo usaria para el contrato que devuelva
// las funciones de la data para los controladores
export type TipadoData<T> ={
    error : boolean;
    message : string;
    data ?: T ;
    paginacion ? : {
                    pagina : number ,
                    limite : number,
                    contadorPagina : number,
                    /** TOTAL de filas de la consulta, no solo las de esta pagina.
                     *  Lo despacha `hooks/funcionListar.ts` cuando la SQL lleva
                     *  `COUNT(*) OVER()`. Lo usa el carrusel de anuncios del
                     *  alumno para el contador "X de Y" (spec 019). */
                    totalRegistros? : number};
    code : string;
    errorsDetails?: any;
    /** Metadatos extra (ej: error MySQL detail en transacciones fallidas) */
    detail?: any;
}

// --------------- PLANES ------------------
// DataPlan es el tipado de los datos que se manejan en la tabla planes_mensuales_admin
// Se usa para tipar el retorno de las funciones de la data
export interface DataPlan {
    descripcion: string;
    limites_cedes: number;
    precio_mensual: number;
    estado: string;
}

export interface DataPlanMod {
    id : number ;
    descripcion: string;
    limites_cedes: number;
    precio_mensual: number;
    estado: string;
}

export interface DataPlanesListado {
    id: number;
    descripcion: string;
    limites_cedes: number;
    precio_mensual: number;
    estado: string;
}


// ------------ USUARIOS ------------------
// DataUsuarioNuevo es el tipado de los datos que se manejan al crear un nuevo usuario
export interface DataUsuarioNuevo {
    usuario : string;
    correo : string;    
}

export interface DataIdUsuario{
    usuario: string;
    rol: string;
    razon_social: string;
    /** Rubro de la escuela (`baile` | `gym`). Spec 047. */
    rubro: string;
    tipo: string; 
    estado_suscripcion : string;
}

export interface DataModPublico {
    usuario : string,
    nombre?  : string,
    apellido?: string,
    celular? : string,
    correo?  : string
}

export interface DataModPrivado {
    usuario : string ,
    rol?    : string,
    estado? : string
}

export interface DataMiPerfil {
    usuario: string;
    nombre: string;
    apellido: string;
    correo: string;
    celular: string;
    rol: string;
    id_escuela: number;
}

export interface ModMiPerfilInput {
    usuario_id: number;
    nuevo_usuario?: string;
    nueva_contrasena?: string;
    correo?: string;
    celular?: string;
    /** Opcional: requerida únicamente cuando se envía `nueva_contrasena`
     *  (lo garantiza el refine de modMiPerfilSchema). */
    contrasena_actual?: string;
    /** Resuelto por el Servicio fuera de la transacción para rol alumno */
    dni_alumno?: number;
}

// Sin `contrasena`: el hash NUNCA se selecciona ni sale por la API
// (mismo criterio que `FilaUsuarioAdmin` en data/usuarioAdmin.data.ts).
export interface UsuarioListado {
    usuario: string;
    nombre: string;
    apellido: string;
    celular: string;
    rol: string;
    fecha_alta: string | Date; // Puede ser una cadena ISO o un objeto Date
    correo: string;
    estado: string;
    id_escuela: number
}

// Tipado para el retorno de la función de login
export interface DataLogin {
    usuario: string;
    nombre : string,
    apellido : string,
    estado : string,
    rol : string
    id_escuela : number
}