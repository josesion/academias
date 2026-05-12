import type { 
    MetricasCajaPanelPrincipal, DataCaja, DataAperturaCaja, 
    EstadoCaja, Categoria, ListadoTipoCuentas, metricasTipoCuentas, 
    RegistroDetalleCaja, DetalleApertura , InformeDetalle
} from "../tipadosTs/caja.typado"; 
import { type MetodosPago } from "../componentes/metodoPagoInputs/MetodoPagoInputs";


// ==========================================
// 1. DEFINICIÓN DEL ESTADO (MOLDE)
// ==========================================
export interface CajaTipado {
    // Identidad y Sesión
    dataCaja: DataCaja;
    apertura: DataAperturaCaja;
    
    // UI y Control de Modales
    estadoCaja: EstadoCaja;
    modalesCaja: {
        apertura: boolean;
        cierre: boolean;
    };
    modalesEgresoIngreso: boolean;
    modalAnimaciones : boolean;
    modalAnimacionesApertura  : boolean;
    modalInformeDetalle : boolean;
    // Estados de Carga y Errores
    enviando: boolean;
    errorGenerico: string | null;
    
    // Validadores de Formulario
    verificadorSelector: boolean;
    verificadorSelectorTipo: boolean;

    // Métricas y Datos del Negocio
    panelPrincipal: MetricasCajaPanelPrincipal[] | null;
    listadoExtraordinario: Categoria[] | null;
    listadoCuentasActivas: ListadoTipoCuentas[] | [];
    metricasTipoCuentas: metricasTipoCuentas[] | null;
    metricasCuentasCierre: MetodosPago[] | null;

    // Formularios de Registro
    movimientoExtraordinario: RegistroDetalleCaja;
    aperturaDetalle: DetalleApertura[] | null;
    informeDetalle : InformeDetalle;

    disparadorRefresco: number;
    montoRealFinal: number;
    observaciones : string;
};

// ==========================================
// 2. VALORES INICIALES (ESTADO CERO)
// ==========================================
export const initialState = (config: { id_escuela: number, id_usuario: number , usuario : string}): CajaTipado => ({
    dataCaja: { 
        id_caja: null, 
        id_usuario: config.id_usuario,
        id_escuela: config.id_escuela ,
        usuario   : config.usuario,
    },
    apertura: {
        id_escuela: config.id_escuela,
        estado: "abierta",
        id_usuario_apertura: config.id_usuario
    },
    estadoCaja: "cerrada",
    modalesCaja: { apertura: false, cierre: false },
    modalesEgresoIngreso: false,
    modalAnimaciones : false,
    modalAnimacionesApertura : false,
    modalInformeDetalle : false,
    enviando: false,
    errorGenerico: null,
    verificadorSelector: false,
    verificadorSelectorTipo: false,
    panelPrincipal: null,
    metricasTipoCuentas: null,
    listadoExtraordinario: null, 
    metricasCuentasCierre: null,
    movimientoExtraordinario: {
        id_caja: null,
        id_categoria: null,
        id_cuenta: null,
        id_usuario: config.id_usuario,
        monto: "",
        descripcion: "",
        referencia_id: 0,
        id_escuela: config.id_escuela,
        tipo: ""
    },
    listadoCuentasActivas: [],
    aperturaDetalle: null,
    informeDetalle :{
        id_movimiento : 0,
        tipo: "ingreso",
        metodo: "",
        monto: 0,
        descripcion: "",
        observaciones: null,
        fecha: "",
        hora: "",
        metodo_pago: "",
        usuario : "",
        nombre_alumno_vinculado:null,
    },
    disparadorRefresco: 0,
    montoRealFinal: 0,
    observaciones : "",
});

// ==========================================
// 3. ACCIONES (EVENTOS DEL SISTEMA)
// ==========================================
export type CajaAction =
    // --- Eventos de UI (Modales y Loading) ---
    | { type: 'ABRIR_MODAL'; payload: 'apertura' | 'cierre' }
    | { type: 'ABRIR_MODAL_IE' } 
    | { type: 'ABRIR_MODAL_ANIMACION' }  
    | { type: 'ABRIR_MODAL_INFORME' }  
    | { type: 'ABRIR_MODAL_ANIMACION_APERTURA' }         
    | { type: 'CERRAR_MODALES' }
    | { type: 'CERRAR_MODALES_IE' } 
    | { type: 'CERRAR_MODAL_ANIMACION' }
    | { type: 'CERRAR_MODAL_ANIMACION_APERTURA' }  
    | { type: 'CERRAR_MODAL_INFORME' }    
         
    | { type: 'CARGADO' }
    | { type: 'INICIAR_OPERACION' }
    | { type: 'FINALIZAR_OPERACION' }   
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'DISPARAR_REFRESCO' }

    // --- Validadores de Selectores ---
    | { type: 'VERIFICADOR_SELECTOR'; payload: boolean }
    | { type: 'VERIFICADOR_SELECTOR_TIPO'; payload: boolean }

    // --- Carga de Datos y Sincronización ---
    | { type: 'SET_CAJA_ACTIVA'; payload: { id_caja: number | null, estado: 'abierta' | 'cerrada' } }
    | { type: 'SET_PANEL_PRINCIPAL'; payload: MetricasCajaPanelPrincipal[] | null }
    | { type: 'SET_LISTADO_EXTRAORDINARIO'; payload: Categoria[] | null } 
    | { type: 'SET_LISTADO_CUENTAS_ACTIVAS'; payload: ListadoTipoCuentas[] } 
    | { type: 'SET_METRICAS_TIPO_CUENTAS'; payload: metricasTipoCuentas[] | null }    
    | { type: 'SET_METRICAS_CIERRE_CUENTAS'; payload: MetodosPago[] | null } 
    | { type: 'SET_APERTURA_DETALLE'; payload: DetalleApertura[] | null } 
    | { type: 'SET_MONTO_FINAL'; payload: number } 
    | { type: 'SET_OBSERVACIONES'; payload: string } 
    | { type: 'SET_INFORME_DETALLE'; payload: InformeDetalle }               
    
    // --- Manejo de Formularios (Update & Reset) ---
    | { type: 'UPDATE_MONTO_REAL_CIERRE'; payload: { nombreCuenta: string; valorCuenta: number | string } }  
    | { type: 'UPDATE_MONTO_APERTURA_DETALLE'; payload: { nombreCuenta: string; valorCuenta: number | string } }   
    | { type: 'INICIALIZAR_METODO_PAGO'; payload: metricasTipoCuentas[] }
    | { type: 'UPDATE_MOVIMIENTO_EXTRA'; payload: { campo: keyof RegistroDetalleCaja; valor: any } }
    | { type: 'RESET_MOVIMIENTO_EXTRA'; payload: 'ingreso' | 'egreso' | "" }


    | { type: 'FORMATEAR_MOV_EXTRAORDINARIOS' }
    | { type: 'RESET_MONTO_APERTURA_DETALLE' ; payload :  DetalleApertura[]  | null}
    | { type: "RESET_MONTO_CUENTAS_CIERRE" ; payload :  MetodosPago[]  | null}; 

// ==========================================
// 4. EL CEREBRO (REDUCER)
// ==========================================
export const cajaReducer = (state: ReturnType<typeof initialState>, action: CajaAction): ReturnType<typeof initialState> => {
    switch (action.type) {

        // --- BLOQUE: CONTROL DE UI ---
        case 'INICIAR_OPERACION':
            return { ...state, enviando: true, errorGenerico: null };

        case 'FINALIZAR_OPERACION':
            return { ...state, enviando: false, errorGenerico: null };

        case 'CARGADO':
            return { ...state, enviando: false };

        case 'SET_ERROR':
            return { ...state, errorGenerico: action.payload, enviando: false };

        case 'ABRIR_MODAL':
            return {
                ...state,
                modalesCaja: { ...state.modalesCaja, [action.payload]: true },
                errorGenerico: null
            };

        case 'CERRAR_MODALES':
            return {
                ...state,
                modalesCaja: { apertura: false, cierre: false },
                enviando: false
            };

        case 'ABRIR_MODAL_IE':
            return {
                ...state,
                modalesEgresoIngreso: true,
                errorGenerico: null
            };

        case 'ABRIR_MODAL_INFORME':
            return {
                ...state,
                modalInformeDetalle: true
            };

        case 'CERRAR_MODALES_IE':
            return {
                ...state,
                modalesEgresoIngreso: false,
                enviando: false
            };
        case 'ABRIR_MODAL_ANIMACION':
            return {
                ...state,
                modalAnimaciones: true,
                errorGenerico: null
            };

        case 'CERRAR_MODAL_ANIMACION':
            return {
                ...state,
                modalAnimaciones: false,
                enviando: false
            }; 
            
        case 'ABRIR_MODAL_ANIMACION_APERTURA':
            return {
                ...state,
                modalAnimacionesApertura: true,
                errorGenerico: null
            };  

        case 'CERRAR_MODAL_ANIMACION_APERTURA':
            return {
                ...state,
                modalAnimacionesApertura: false,
                enviando: false
            }; 
        case 'CERRAR_MODAL_INFORME':
            return {
                ...state,
                modalInformeDetalle: false
            };

        // --- BLOQUE: VALIDACIONES ---
        case 'VERIFICADOR_SELECTOR':
            return { ...state, verificadorSelector: action.payload };

        case 'VERIFICADOR_SELECTOR_TIPO':
            return { ...state, verificadorSelectorTipo: action.payload };

        // --- BLOQUE: DATOS DE CAJA Y NEGOCIO ---
        case 'SET_CAJA_ACTIVA':
            return {
                ...state,
                estadoCaja: action.payload.estado,
                dataCaja: { ...state.dataCaja, id_caja: action.payload.id_caja },
                enviando: false,
                modalesCaja: { ...state.modalesCaja, apertura: false }
            };

        case 'SET_PANEL_PRINCIPAL':
            return { ...state, panelPrincipal: action.payload, enviando: false };

        case 'SET_LISTADO_EXTRAORDINARIO':
            return { ...state, listadoExtraordinario: action.payload, enviando: false };
        
        case 'SET_LISTADO_CUENTAS_ACTIVAS':
            return { ...state, listadoCuentasActivas: action.payload, enviando: false };

        case "SET_METRICAS_TIPO_CUENTAS":
            return { ...state, metricasTipoCuentas: action.payload };

        case "SET_METRICAS_CIERRE_CUENTAS":
            return { ...state, metricasCuentasCierre: action.payload };

        case "SET_APERTURA_DETALLE": 
            return { ...state, aperturaDetalle: action.payload };

        case "SET_MONTO_FINAL": 
            return { ...state, montoRealFinal : action.payload };

        case "SET_OBSERVACIONES" :
            return { ...state, observaciones : action.payload };    

        case 'DISPARAR_REFRESCO':
            return { ...state, disparadorRefresco: state.disparadorRefresco + 1 };

        case 'SET_INFORME_DETALLE':
            return { ...state, informeDetalle : action.payload };         


        // --- BLOQUE: ACTUALIZACIÓN DE FORMULARIOS ---
        case 'UPDATE_MONTO_REAL_CIERRE':
            return {
                ...state,
                metricasCuentasCierre: (state.metricasCuentasCierre || []).map((det) => (
                    det.nombre_cuenta === action.payload.nombreCuenta 
                    ? { ...det, monto_real: Number(action.payload.valorCuenta) } 
                    : det
                ))
            };

        case "UPDATE_MONTO_APERTURA_DETALLE":
            return {
                ...state,
                aperturaDetalle: (state.aperturaDetalle || []).map((det) => (
                    det.nombre_cuenta === action.payload.nombreCuenta 
                    ? { ...det, monto: Number(action.payload.valorCuenta) } 
                    : det
                ))
            };

        case 'UPDATE_MOVIMIENTO_EXTRA':
            return {
                ...state,
                movimientoExtraordinario: {
                    ...state.movimientoExtraordinario,
                    [action.payload.campo]: action.payload.valor
                }
            };

        
        // --- BLOQUE: RESET Y RE-INICIALIZACIÓN ---
        case 'RESET_MOVIMIENTO_EXTRA':
            return {
                ...state,
                movimientoExtraordinario: {
                    id_caja: state.dataCaja.id_caja,
                    id_usuario: state.dataCaja.id_usuario,
                    id_escuela: state.dataCaja.id_escuela,
                    id_categoria: null,
                    id_cuenta: null,
                    monto: "",
                    descripcion: "",
                    referencia_id: 0,
                    tipo: action.payload
                }
            };

        case 'INICIALIZAR_METODO_PAGO':
            return {
                ...state,
                metricasCuentasCierre: action.payload.map(cuenta => ({
                    id_cuenta: cuenta.id_cuenta,
                    nombre_cuenta: cuenta.nombre_cuenta,
                    tipo_cuenta: cuenta.tipo_cuenta,
                    monto_sistema: Number(cuenta.saldo_final_cuenta),
                    monto_real: "", 
                }))
            };


        case 'FORMATEAR_MOV_EXTRAORDINARIOS':
            return {
                ...state,
                movimientoExtraordinario: {
                    id_caja: null,
                    id_categoria: null,
                    id_cuenta: null,
                    id_usuario: state.dataCaja.id_usuario, // Mantenemos los IDs de config
                    monto: "",
                    descripcion: "",
                    referencia_id: 0,
                    id_escuela: state.dataCaja.id_escuela,
                    tipo: ""
                }
            };  
            
        case "RESET_MONTO_APERTURA_DETALLE":
            return {
                ...state,
                aperturaDetalle: (state.aperturaDetalle || []).map((det) => ({
                    ...det,
                    monto: 0 // Seteamos el monto a cadena vacía para todos
                }))
            };
            
        case "RESET_MONTO_CUENTAS_CIERRE" :
            return {
                ...state,
                metricasCuentasCierre : (state.metricasCuentasCierre || []).map((det) =>({
                    ...det,
                    monto_real : 0
                }))
            };    

        default:
            return state;
    }
};