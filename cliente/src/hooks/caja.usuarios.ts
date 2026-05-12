import { useState , useEffect , useCallback, useRef, useReducer} from "react";
import { useIncripcionesUsuarios } from "../hookNegocios/Inscripciones";
// utils -------------------------------------------------------------
import { idCajaFuntion } from "../utils/idCaja";

//Seccion de Tipados--------------------------------------
import type{  
           DetalleCajaMovimientoResult ,  scrollStateData,  RegistroDetalleCaja,  
           ListadoTipoCuentas,    DataCierreCaja,
           JsonDataCierre
        
        } from "../tipadosTs/caja.typado";


type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;


import { cajaReducer, initialState } from "../reducers/cajaReducers";


interface DataCajaUsuariosConfig {
    id_escuela : number, 
    id_usuario : number,
    usuario    : string,
    
    servicios : {
         metricasPanelCaja : ServicioCrud,
         obtenerIdCaja     : ServicioCrud,
         abrirCaja : ServicioCrud,
         cerrarCaja : ServicioCrud,
         movimientoCajaDetalle : ServicioCrud,
         listadoCategoriaCaja : ServicioCrud,
         registrarMovimientoCaja : ServicioCrud,
         listadoTipoCuentas : ServicioCrud,
         metricasPanelPrincipal :ServicioCrud
    }
};

export const  useCajaUsuario = ( config : DataCajaUsuariosConfig ) =>{

    const { actualizarIngresoInscipcion } = useIncripcionesUsuarios();//  para actrualizar los parametros por la inscripcion

    const [ state , dispatch] = useReducer( cajaReducer, initialState({
        id_escuela: config.id_escuela,
        id_usuario : config.id_usuario,
        usuario    : config.usuario,
    }));


    //------------------  Estados detalle de caja ------------------
    const observer = useRef<IntersectionObserver | null>(null); 
    const [movimientos, setMovimientos] = useState<DetalleCajaMovimientoResult[]>([]);
    const [scrollState, setScrollState] = useState<scrollStateData>({
        loading: false,
        hasMore: true,
        offset: 0,
        limite: 5
    });

   //------------------- Estados Tipo Cuentas ---------------------

   // --filtroCuentasEstatica -- queda fijo por q solo en caja se muestran las cuentas activas de esa escuela 
   const filtroCuentasEstatica = {
        id_escuela : config.id_escuela,
        estado : "activos"
   }; 


// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//                    SECCION PARA LOS HANDLES  DE INGRESOS O EGRESOS DE CAJA 
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────     

// ──────────────────────────────────────────────────────────────
//Hanldes para manejar los estados de de INGRESOS EGRESOS
// ────────────────────────────────────────────────────────────── 
 
const handleMovimientoExtraordinarioChange = (e: React.ChangeEvent< HTMLSelectElement>) => {

    if (e.target.value ){
        dispatch({
            type : "UPDATE_MOVIMIENTO_EXTRA" ,
            payload : { campo : e.target.name as keyof RegistroDetalleCaja , valor : Number(e.target.value)}    
        });

        dispatch({ type : "VERIFICADOR_SELECTOR" , payload : true});

    }else{
         dispatch({ type : "VERIFICADOR_SELECTOR" , payload : false});
    };
};

    // --- Cerramos el modal y seteamos a 0 los estados
const handleCerrarModalEgrIng = () =>{

    dispatch({ type : "SET_LISTADO_EXTRAORDINARIO", payload : null});

    dispatch({ type : "RESET_MOVIMIENTO_EXTRA" , payload : ""});

    dispatch({ type : "CERRAR_MODALES_IE" });
    
    dispatch({
        type : "SET_ERROR",
        payload : null
    });
};


   // --- capturamos el id del tipo de cuenta
const handleTipoPagoChange = (e: React.ChangeEvent< HTMLSelectElement>) => {
 
    if (e.target.value) {
        dispatch({
            type : "UPDATE_MOVIMIENTO_EXTRA" ,
            payload : { campo : e.target.name as keyof RegistroDetalleCaja , valor : Number(e.target.value)}    
        });        

        dispatch({ type : "VERIFICADOR_SELECTOR_TIPO" , payload : true});
    }else {
        dispatch({ type : "VERIFICADOR_SELECTOR_TIPO" , payload : false});

    };
};

  // --- capturamos el monto para tipo de cuentas
const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    if (value){
        dispatch({
            type : "UPDATE_MOVIMIENTO_EXTRA" ,
            payload : { campo : name as keyof RegistroDetalleCaja , valor : Number(value)}    
        });
   
    }else{
        dispatch({
            type : "UPDATE_MOVIMIENTO_EXTRA" ,
            payload : { campo : name as keyof RegistroDetalleCaja , valor : ""}    
        }); 

    };
};

   // --- capturamos  la descroipcion si es q se le coloca algo en ella     
const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
   const { value, name } = e.target;
    if (value === "" ){
        dispatch({
            type : "UPDATE_MOVIMIENTO_EXTRA" ,
            payload : { campo : name as keyof RegistroDetalleCaja , valor : ""}    
        });   
       
    }else{       
        dispatch({
            type : "UPDATE_MOVIMIENTO_EXTRA" ,
            payload : { campo : name as keyof RegistroDetalleCaja , valor : value}    
        }); 
      
    };

};

    // --- Registramos el movimiento INGRESO/EGRESO 
const handRegistarMovimientoExtraordinario = async () => {

    if (state.dataCaja.id_caja === null){
         return   dispatch({
            type : "SET_ERROR",
            payload : "Caja esta cerrada"
      });
    }; 
    if ( !state.verificadorSelector  || state.movimientoExtraordinario.monto === "" || !state.verificadorSelectorTipo   ) {
        
      return    dispatch({
            type : "SET_ERROR",
            payload : "Verificar los campos del formulario"
      });

    }else{

        const data = {
            id_caja       : state.dataCaja.id_caja,
            id_escuela    : Number(config.id_escuela), 
            id_categoria  : Number(state.movimientoExtraordinario.id_categoria),
            monto         : Number(state.movimientoExtraordinario.monto),
            id_cuenta     : Number(state.movimientoExtraordinario.id_cuenta),
            id_usuario    : Number(state.movimientoExtraordinario.id_usuario),
            descripcion   : state.movimientoExtraordinario.descripcion,
            referencia_id : 0       
        };
   

        const servicioApiFetch =config.servicios.registrarMovimientoCaja;
        const registroMovimientoResult = await servicioApiFetch(data); 


        if (registroMovimientoResult.code === "DETALLE_CAJA_OK") {

            dispatch({ type : "DISPARAR_REFRESCO"});

            dispatch({
                type : "SET_ERROR",
                payload :null
            });

            setMovimientos([]);
            setScrollState({
                loading: false,
                hasMore: true,
                offset: 0,
                limite: 5
            });
            await cargarMovimientos(); 
            dispatch({ type : "RESET_MOVIMIENTO_EXTRA" , payload : ""});           

            dispatch({ type : "CERRAR_MODALES_IE" })
        }else{
           
            dispatch({
                type : "SET_ERROR",
                payload : registroMovimientoResult.message
            });
        };
    };

};

 // --- Seteamos los estados para abrir y determinar q el listado sea Ingreso
const handleAbrirIngreso =  async () => {
    dispatch({ type : "UPDATE_MOVIMIENTO_EXTRA" , payload : { campo : "tipo" , valor : "ingreso"}});

    dispatch({ type : "ABRIR_MODAL_IE"});

    const servicioApiFetch = config.servicios.listadoCategoriaCaja;
    const listadoIngresos = await servicioApiFetch({
        id_escuela : state.dataCaja.id_escuela,
        tipo : "ingreso",
        estado : "activos"
    });
    
    dispatch({ type : "SET_LISTADO_EXTRAORDINARIO", payload : listadoIngresos.data});
};

 // --- Seteamos los estados para abrir y determinar q listado sea Egreso
const handleAbrirEgreso = async () => {

    dispatch({ type : "UPDATE_MOVIMIENTO_EXTRA" , payload : { campo : "tipo" , valor : "egreso"}});

    dispatch({ type : "ABRIR_MODAL_IE"});
    
    const servicioApiFetch = config.servicios.listadoCategoriaCaja;
    const listadoEgresos = await servicioApiFetch({
        id_escuela :  state.dataCaja.id_escuela,
        tipo : "egreso",
        estado : "activos"
    });
    
    dispatch({ type : "SET_LISTADO_EXTRAORDINARIO", payload : listadoEgresos.data});
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
 

// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//                     SECCION HANDLES  ESTADO DE CAJA  ( ABIERTA / CERRADA ) 
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── 



// ──────────────────────────────────────────────────────────────
//Hanldes para manejar los estados de caja
// ────────────────────────────────────────────────────────────── 

const handleEstadosCaja = () =>{
   
    try{
         dispatch({ type : "INICIAR_OPERACION"});
        if ( state.dataCaja.id_caja === null){
                dispatch({
                    type : "ABRIR_MODAL",
                    payload : "apertura"
                });
        }else{
                dispatch({
                    type : "ABRIR_MODAL",
                    payload : "cierre"
                });
        };
        
    }catch(error){

    }finally{
       dispatch({ type : "CARGADO"})
    };
};

// ──────────────────────────────────────────────────────────────
//Handle para Cachear los monto iniciales
// ────────────────────────────────────────────────────────────── 

   // --- Capturamos el monto de las cuentas para determinar el saldo inical de cada una
const cachearMontoIniciales = (id_cuenta: number, nombre: string, valor: string) => {

    const montoFinal = valor === "" ? "" : Number(valor);
    const idCuenta = id_cuenta;

    if (valor !== "" && isNaN(Number(valor))) return;

    dispatch({ type : "UPDATE_MONTO_APERTURA_DETALLE", payload : {  nombreCuenta : nombre , valorCuenta : montoFinal}});
};




// ──────────────────────────────────────────────────────────────
//  Handle para Abrir caja 
// ────────────────────────────────────────────────────────────── 

const handleAbrirCaja = async() =>{

    try{
         dispatch({ type : "INICIAR_OPERACION"});

        // Si es q un monto es "" lo limpiamos o lo colocamos en  0
        const detalleLimpiado = state.aperturaDetalle?.map((item) => {
            const montoRaw = item.monto as unknown; 
            return {
                    ...item,
                    monto: montoRaw === "" ? 0 : Number(montoRaw)
            };
        });
        
        const data = {
            id_escuela : state.dataCaja.id_escuela,
            estado : "abierta",    
            id_usuario_apertura : state.dataCaja.id_usuario,    
            detalle : detalleLimpiado // a modificar mas a delante
        };

        
       const servicioApiFetch = config.servicios.abrirCaja;
       const aperturaCajaResult = await servicioApiFetch(data);

///  AGREGAR ANIMACION DE CAJA ABIERTA

        if (aperturaCajaResult.code === "CAJA_ABIERTA_OK"){
            dispatch({ type : "CERRAR_MODALES"});
            dispatch({ type : "ABRIR_MODAL_ANIMACION_APERTURA"});    

            setScrollState({
                loading: false,
                hasMore: true,
                offset: 0,
                limite: 5
            });
            setMovimientos([]); 

            dispatch({
                type : "SET_CAJA_ACTIVA",
                payload : { 
                     id_caja : aperturaCajaResult.data.id_caja,
                     estado  : "abierta"
                 }
            });

            setTimeout(() => {  
               dispatch({ type : "CERRAR_MODAL_ANIMACION_APERTURA"});                
            }, 2000);             
    
        }else{
            dispatch({
                type : "SET_ERROR",
                payload : aperturaCajaResult.errorsDetails?.[0].message || "Error al abrir caja"
            });
        };

    }catch(error){
        dispatch({
            type : "SET_ERROR",
            payload :"Error servidor,  al abrir caja "
        });        
    }finally{
       dispatch({ type : "CARGADO"})
    };
};
// ──────────────────────────────────────────────────────────────
//  Handle para cachear observaciones cierre caja
// ────────────────────────────────────────────────────────────── 

const hanldeObsevacionesCierre = async( event: React.ChangeEvent<HTMLTextAreaElement>) =>{
  
    const valorObse : string = event.target.value;
    if ( valorObse ){
        dispatch({ type : "SET_OBSERVACIONES" , payload : event.target.value});
    }else{
        dispatch({ type : "SET_OBSERVACIONES" , payload : ""});
    };

};


// ──────────────────────────────────────────────────────────────
//  Handle para Cerrar caja
// ────────────────────────────────────────────────────────────── 
  

const handleCerrarCaja =async () =>{
  

    if (!state.dataCaja?.id_caja) {
        dispatch({
            type : "SET_ERROR",
            payload :"Error: No se encontró un ID de caja activo."
        });          
        return;
    }


    let dataDetalleCuentas : JsonDataCierre[] = [];
  

    if (state.metricasTipoCuentas && state.metricasTipoCuentas.length > 0) {
    
           dataDetalleCuentas = state.metricasTipoCuentas.map((item) => {
                return {
                    id_cuenta: Number(item.id_cuenta), // Aseguramos que sea number
                    nombre_cuenta: item.nombre_cuenta,
                    sistema: item.saldo_final_cuenta,   // Lo que el sistema dice que hay
                    real: item.movimiento_sesion,      // Inicializamos 'real' con lo mismo (el usuario luego lo edita)
                };
           });
    };
    


    let dataCierreCaja :  DataCierreCaja  | null=  null ;

    if (!dataDetalleCuentas || dataDetalleCuentas.length === 0) {
       dispatch({ type : "SET_ERROR" , payload :"No se pudo generar el detalle del arqueo" })
       return; 
    }
    
    if ( state.panelPrincipal &&  state.dataCaja.id_caja && state.dataCaja.id_escuela && config.id_usuario){
    
        dataCierreCaja = {
                id_caja: state.dataCaja.id_caja,
                id_escuela: config.id_escuela,
                id_usuario_cierre: config.id_usuario,
            
                monto_final_real: Number(state.montoRealFinal), 
                monto_sistema: state.panelPrincipal[0].balance_neto ?? 0,
                diferencia_total: Number(state.montoRealFinal) - state.panelPrincipal[0].balance_neto,
                arqueo_detalle: dataDetalleCuentas,
                observaciones_cierre : state.observaciones 
        };
    };

    try{
        dispatch({ type : "INICIAR_OPERACION"});

         const servicioApiFetch = config.servicios.cerrarCaja;
         const cierreCajaResult = await servicioApiFetch( dataCierreCaja );
    
        if (cierreCajaResult.code === "CIERRE_CAJA_OK"){
           
            dispatch({type : "ABRIR_MODAL_ANIMACION" });
            dispatch({type : "SET_CAJA_ACTIVA" , payload : { id_caja : null , estado : "cerrada"}});
            dispatch({type : "CERRAR_MODALES"});
        
           setTimeout(() => {  
             dispatch({type : "CERRAR_MODAL_ANIMACION" }); 
             dispatch({type : "RESET_MONTO_APERTURA_DETALLE" , payload : state.aperturaDetalle })  
             dispatch({type : "FORMATEAR_MOV_EXTRAORDINARIOS"});
             dispatch({ type : "RESET_MONTO_CUENTAS_CIERRE" , payload : state.metricasCuentasCierre});
           }, 2000);           
        };
        if (cierreCajaResult.code === "NO_HAY_CAJA_ABIERTA"){
           return dispatch({ type : "SET_ERROR" , payload : "No existe caja abierta"}); 
        }       

    }catch(error){
        dispatch({ type : "SET_ERROR" , payload : "Error en el servidor"});
    }finally{
        dispatch({ type : "FINALIZAR_OPERACION"}); 
    };
};

// ──────────────────────────────────────────────────────────────
//Handle para Cerrar Caja Abierta
// ────────────────────────────────────────────────────────────── 

const handleAbrirCajaModalCerrar = () =>{

    dispatch({
        type : "CERRAR_MODALES"
    });

    dispatch({ type : "RESET_MOVIMIENTO_EXTRA" , payload : ""});

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
//Handle  INFORMES DE DETALLE
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


const hanldeCerrarInforme = () =>{
     console.log("a")
    dispatch({type : "CERRAR_MODAL_INFORME"});
};
  


// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//                     FUNCIONES PARA CARAGAR LOS DETALLES DE CAJA CON SCROLL INFINITO
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── 


// ──────────────────────────────────────────────────────────────
//Metodo para cargar los movimientos de caja con scroll infinito
// ────────────────────────────────────────────────────────────── 

const cargarMovimientos = useCallback(async () => {
    // Si no hay ID, o ya está cargando, o no hay más: FRENAMOS
    if (!state.dataCaja.id_caja || scrollState.loading || !scrollState.hasMore) { return }; 

    setScrollState(prev => ({ ...prev, loading: true }));

    try {
        const dataDetalle = {
            id_caja: state.dataCaja.id_caja,
            limite: scrollState.limite,
            offset: scrollState.offset
        };

        const res = await config.servicios.movimientoCajaDetalle(dataDetalle);
        
        if (res.code === "MOVIMIENTOS_CAJA_OK" && Array.isArray(res.data) ) {
            setMovimientos(prev => [...prev, ...res.data]);
            setScrollState(prev => ({
                ...prev,
                loading: false,
                offset: prev.offset + prev.limite,
                hasMore: res.data.length === prev.limite
            }));
        } else {
            setScrollState(prev => ({ ...prev, loading: false, hasMore: false }));
        }
    } catch (error) {
        setScrollState(prev => ({ ...prev, loading: false }));
    };
}, [state.dataCaja.id_caja, scrollState.offset, scrollState.limite, scrollState.hasMore, scrollState.loading]);


// ──────────────────────────────────────────────────────────────
// Configuración del IntersectionObserver para el scroll infinito
// ────────────────────────────────────────────────────────────── 
const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    // 1. Si está cargando, no hacemos nada
    if (scrollState.loading) return;

    // 2. Si ya existía un observador, lo desconectamos para limpiar
    if (observer.current) observer.current.disconnect();

    // 3. Creamos el nuevo observador
    observer.current = new IntersectionObserver(entries => {
        // Si el div es visible en pantalla Y hay más datos por cargar...
        if (entries[0].isIntersecting && scrollState.hasMore) {
            // ...disparamos la función que ya tiene el offset actualizado
            cargarMovimientos();
        }
    });
   
    // 4. Le decimos al observador que mire el div (el nodo)
    if (node) observer.current.observe(node); 

}, [scrollState.loading, scrollState.hasMore, cargarMovimientos, state.dataCaja.id_caja]); // Dependencias: cargarMovimientos y dataCaja.id_caja (porque se usa dentro de cargarMovimientos)
// Importante: cargarMovimientos debe estar en las dependencias


// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
//        USEEFECT SECCION 1-IDCAJA    2-METRICAS   3-DETALLE DE CAJA  4- LISTA TIPO CUENTAS  5-METRICAS PANEL PRINCIPAL 
//                         6-METRICAS CIERRE CAJA 
// ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── 

// ──────────────────────────────────────────────────────────────
//Obtener el monto real contado por el usuario
// ────────────────────────────────────────────────────────────── 
useEffect(() => {
    // 1. Tomamos la lista del Reducer
    const listaParaCalcular = state.metricasCuentasCierre || [];
    
    // 2. Calculamos el total
    const total = listaParaCalcular.reduce((acc, cuenta) => {
        return acc + (Number(cuenta.monto_real) || 0);
    }, 0);

    // 3. Lo guardamos en el useState local

    dispatch({ type : "SET_MONTO_FINAL" , payload : total})

}, [state.metricasCuentasCierre, state.disparadorRefresco]);

// ──────────────────────────────────────────────────────────────
//Obtener id de caja
// ────────────────────────────────────────────────────────────── 

useEffect( ()=> {
    const idCaja = async () => {
    
        const idCajaResult = await idCajaFuntion(config.id_escuela);
        
        if ( idCajaResult){
           
            dispatch({
                type : "SET_CAJA_ACTIVA",
                payload : {
                    id_caja : idCajaResult,
                    estado   : "abierta"
                }
            });

            dispatch({
                type : 'SET_ERROR' ,
                payload : null
            });

            dispatch({ type : "UPDATE_MOVIMIENTO_EXTRA" , payload : { campo : "id_caja" , valor : idCajaResult}});

        }else{ 
            dispatch({
                type : "SET_CAJA_ACTIVA",
                payload : {
                    id_caja : null,
                    estado   : "cerrada"
                }
            });
        };
    };
    idCaja();
},[]);  




// ──────────────────────────────────────────────────────────────
//Obtener las metricas para el panel metodos de pago
// ────────────────────────────────────────────────────────────── 

useEffect( ()=> {
    const metricas = async () => {
        const servicioApiFetch = config.servicios.metricasPanelCaja;

        const data = {
            id_caja : state.dataCaja.id_caja,
            id_escuela : state.dataCaja.id_escuela
        };

        const metricasCajaResult = await servicioApiFetch(data);

        if (metricasCajaResult.code ===  "METRICAS_CAJA_CUENTAS_OK" ){

            dispatch({ type : "SET_METRICAS_TIPO_CUENTAS" , payload : metricasCajaResult.data });
           
        }else{
         
           dispatch({ type : "SET_METRICAS_TIPO_CUENTAS" , payload : null });

        };
    };

    metricas();

},[state.dataCaja.id_caja, actualizarIngresoInscipcion, state.estadoCaja, state.disparadorRefresco] );    


// ──────────────────────────────────────────────────────────────
//Obtener  los movimientos de caja para el detalle
// ────────────────────────────────────────────────────────────── 

useEffect(() => {

    if (state.dataCaja.id_caja) {
        cargarMovimientos();
    } else {
      
        setMovimientos([]);
        setScrollState({
            loading: false,
            hasMore: true,
            offset: 0,
            limite: 5
        });
    }
}, [state.dataCaja.id_caja, cargarMovimientos]);

// ──────────────────────────────────────────────────────────────
// Obtener el listado de tipo cuentas activas para el selector de movimiento extraordinario
// ──────────────────────────────────────────────────────────────
     
useEffect( ()=> {

    const obtenerListadoCuentas = async () => {
        const servicioApiFetch = config.servicios.listadoTipoCuentas;
        const resultListacoCuentas = await servicioApiFetch( filtroCuentasEstatica);
       
        if ( resultListacoCuentas.code === "LISTA_TIPOS_CUENTAS_OK"){
            dispatch({
                type : "SET_LISTADO_CUENTAS_ACTIVAS",
                payload : resultListacoCuentas.data
            });
         //   setListadoCuentasActivas(resultListacoCuentas.data);
            const detallesIniciales = resultListacoCuentas.data.map((cuenta: ListadoTipoCuentas) => ({
                id_cuenta: cuenta.id_cuenta,
                nombre_cuenta: cuenta.nombre_cuenta,
                monto: "" // Nacen en cero para que no fallen al enviar
            }));

            dispatch({ type : "SET_APERTURA_DETALLE" , payload : detallesIniciales})

            //setAperturaDetalle(detallesIniciales);
        }else{
            dispatch({
                type : "SET_LISTADO_CUENTAS_ACTIVAS",
                payload : []
            });
            dispatch({
                type : "SET_ERROR",
                payload : resultListacoCuentas.message || "Error sin listado cuentas" 
            });
        };
    };

    obtenerListadoCuentas();

}, []);

// ──────────────────────────────────────────────────────────────
// Obtener los montos de las metricas del panel proncipal
// ──────────────────────────────────────────────────────────────

useEffect( ()=> {

    const metricasPrincipalCaja = async () =>{
        const servicioApiFetch = config.servicios.metricasPanelPrincipal;
        const metricasResult = await servicioApiFetch(state.dataCaja);
      
        if (metricasResult.code === 'METRICAS_PRINCIPAL_OK'){   
           
            dispatch({ type : "SET_PANEL_PRINCIPAL" , payload : metricasResult.data });

        }else{

            dispatch({ type : "SET_PANEL_PRINCIPAL" , payload : null });

        };
    };

    metricasPrincipalCaja();

}, [ state.dataCaja.id_caja , actualizarIngresoInscipcion,  state.movimientoExtraordinario] );


// ──────────────────────────────────────────────────────────────
// Obtener los metodos de pago para mandarlos al cierre de caja
// ──────────────────────────────────────────────────────────────

useEffect( ()=> {

    if ( state.metricasTipoCuentas  && state.metricasTipoCuentas.length > 0){

        dispatch({ 
            type: 'INICIALIZAR_METODO_PAGO', 
            payload: state.metricasTipoCuentas 
        });

    };

},[state.metricasTipoCuentas]);   

    return{
        state,
      

        handleEstadosCaja,
        handleAbrirCajaModalCerrar,
        handleAbrirCaja,
        handleCerrarModalCerrar,
        handleCerrarCaja,

        cachearMontoIniciales,

        lastElementRef,
        movimientos,
        scrollState,


        handleMovimientoExtraordinarioChange,
        handleTipoPagoChange,
        handleCerrarModalEgrIng,
        handRegistarMovimientoExtraordinario,
        handleMontoChange,
        handleMemoChange,
        handleAbrirEgreso,
        handleAbrirIngreso,
        hanldeObsevacionesCierre,
        handleCierreMontos,
        handleCachearDetalle,
        hanldeCerrarInforme,
    };
};    
