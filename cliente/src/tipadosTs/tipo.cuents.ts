
type tipo_cuenta =  "fisico" | "virtual" | "todos" ;
type estado_cuenta = "activos" | "inactivos" | "todos";

export interface DataTipoCuentas {
    id_escuela : number,
    nombre_cuenta : string,
    tipo_cuenta : tipo_cuenta,
    estado : estado_cuenta
};

export interface TipoCuentas {
    id_escuela : number,
    nombre_cuenta : string,
    tipo_cuenta : tipo_cuenta,
}; 

export interface ResultTipoCuentasAlta {
    id: number,
    nombre_cuenta : string,
    tipo_cuenta : tipo_cuenta    
};

export interface TipoCuentasMod {
   nombre_cuenta : string,
   tipo_cuenta : tipo_cuenta,
   id_cuenta : number,
   id_escuela : number 
};

export interface ResultTipoCuentaMod {
    id_cuenta : number,
    nuevo_nombre_cuenta : string,
    nuevo_tipo_cuenta : tipo_cuenta,   
};

export interface EstadoTipoCuenta {
    id_cuenta : number,
    id_escuela : number,
    estado : estado_cuenta     
};

export interface ResultEstadoTipoCuenta {
    id_cuenta : number,
    estado : estado_cuenta
};

export interface ListaTipoCuentas {
    nombre_cuenta : string,
    tipo_cuenta : tipo_cuenta,
    estado : estado_cuenta,
    
    id_escuela : number,
    limite : number,
    pagina : number
};

export interface ResultListaTipoCuentas {
    id_cuenta : number,
    nombre_cuenta : string,
    tipo_cuenta : tipo_cuenta
};