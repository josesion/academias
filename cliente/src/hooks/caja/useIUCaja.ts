
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;


 import type {
   CajaTipado,
   CajaAction
} from "../../reducers/cajaReducers";


interface IuCajaConfig  {
    servicios : {
         listadoCategoriaCaja : ServicioCrud,
    },
    state: CajaTipado;
    dispatch: React.Dispatch<CajaAction>;      
};

export const useIuCaja = ( config : IuCajaConfig) => {
    const { state, dispatch } = config;

    // --- Seteamos los estados para abrir y determinar q el listado sea Ingreso
    const handleAbrirIngreso =  async () => {
        dispatch({ type : "UPDATE_MOVIMIENTO_EXTRA" , payload : { campo : "tipo" , valor : "ingreso"}});

        dispatch({ type : "ABRIR_MODAL_IE"});

        const servicioApiFetch = config.servicios.listadoCategoriaCaja;
        const listadoIngresos = await servicioApiFetch({
            tipo : "ingreso",
            estado : "activos"
        });
        
        dispatch({ type : "SET_LISTADO_EXTRAORDINARIO", payload : listadoIngresos.data});
    };



    //------------ CAPTURAMOS EL MONTO A CADA METODO DE PAGO, PARA EL CIERRE ------------------- //

    const handleCierreMontos = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nombreCuenta = event.target.name;
        const valorCuenta = event.target.value;

        if (valorCuenta !== "" && isNaN(Number(valorCuenta))) return;

        dispatch({ 
            type: 'UPDATE_MONTO_REAL_CIERRE', 
            payload: { nombreCuenta, valorCuenta } 
        });

    };    

 // ──────────────────────────────────────────────────────────────
//Handle para Cerrar Caja Abierta
// ────────────────────────────────────────────────────────────── 

const handleAbrirCajaModalCerrar = () =>{
  
    dispatch({
        type : "CERRAR_MODALES"
    });

    dispatch({ type : "RESET_MONTO_APERTURA_DETALLE", payload : state.aperturaDetalle});

};

// ──────────────────────────────────────────────────────────────
//Handle para Cerrar modal de cierre de caja
// ────────────────────────────────────────────────────────────── 
   
const handleCerrarModalCerrar = () =>{
    dispatch({ type : "RESET_MONTO_CUENTAS_CIERRE" , payload : state.metricasCuentasCierre}); 
    dispatch({
        type : "CERRAR_MODALES"
    });

};
   
// ──────────────────────────────────────────────────────────────
//Handle para abrir INFORMES DE DETALLE
// ────────────────────────────────────────────────────────────── 

const handleCachearDetalle = (   
    id_movimiento : number,  
    tipo: "ingreso" | "egreso",
    metodo: string,
    monto: number,
    descripcion: string,
    observaciones: string | null,
    dia: string,
    hora: string,
    metodo_pago: string,
    nombre_alumno_vinculado: string | null
) =>{

    const data = {
        id_movimiento : id_movimiento,
        tipo : tipo,
        monto  : monto,
        observaciones : observaciones,
        usuario : String(state.dataCaja.usuario),// ver q traiga el usuario y no el id
        fecha : dia,
        hora : hora,
        metodo_pago : metodo_pago,
        descripcion: descripcion,
        metodo : metodo,
        nombre_alumno_vinculado : nombre_alumno_vinculado 
    };    

    dispatch({ type : "SET_INFORME_DETALLE" , payload : data });
    dispatch({ type : "ABRIR_MODAL_INFORME"});
};    

   
// ──────────────────────────────────────────────────────────────
//Handle para cerrar INFORMES DE DETALLE
// ────────────────────────────────────────────────────────────── 
const hanldeCerrarInforme = () =>{
    dispatch({type : "CERRAR_MODAL_INFORME"});
};
  
    // --- Seteamos los estados para abrir y determinar q listado sea Egreso
    const handleAbrirEgreso = async () => {

        dispatch({ type : "UPDATE_MOVIMIENTO_EXTRA" , payload : { campo : "tipo" , valor : "egreso"}});

        dispatch({ type : "ABRIR_MODAL_IE"});
        
        const servicioApiFetch = config.servicios.listadoCategoriaCaja;
        const listadoEgresos = await servicioApiFetch({
        
            tipo : "egreso",
            estado : "activos"
        });
        
        dispatch({ type : "SET_LISTADO_EXTRAORDINARIO", payload : listadoEgresos.data});
    };

    return{
        handleAbrirEgreso,
        hanldeCerrarInforme,
        handleAbrirCajaModalCerrar,
        handleCerrarModalCerrar,
        handleCierreMontos,
        handleAbrirIngreso,
        handleCachearDetalle,
    };

}
