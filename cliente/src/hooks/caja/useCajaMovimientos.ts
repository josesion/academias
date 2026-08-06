import { useState , useEffect , useCallback, useRef } from "react";
import { peticionComunicacion,  recepcionComunicacion } from "../../utils/canalComunicacion";
import { useActualizarAlEnfocar } from "../../utils/useActulizarFocus";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

import type {
   CajaTipado,
   CajaAction
} from "../../reducers/cajaReducers";

//Seccion de Tipados--------------------------------------
import type{  
           DetalleCajaMovimientoResult ,  scrollStateData,  RegistroDetalleCaja,  
        } from "../../tipadosTs/caja.typado";

interface MovimientosCajaConfig {    
    servicios : {
         movimientoCajaDetalle : ServicioCrud,
         registrarMovimientoCaja : ServicioCrud,
         //listadoTipoCuentas : ServicioCrud,
    },
    state: CajaTipado;
    dispatch: React.Dispatch<CajaAction>;    
    stateMetrica: any;
    disparchMetricas: React.Dispatch<any>;
};

export const useCajaMovimientos = ( config : MovimientosCajaConfig ) => {

   
    const { state, dispatch, disparchMetricas } = config;

    //------------------  Estados detalle de caja ------------------
    const observer = useRef<IntersectionObserver | null>(null); 
    const [movimientos, setMovimientos] = useState<DetalleCajaMovimientoResult[]>([]);
    const [scrollState, setScrollState] = useState<scrollStateData>({
        loading: false,
        hasMore: true,
        offset: 0,
        limite: 5
    });

    // ──────────────────────────────────────────────────────────────
    //Metodo para cargar los movimientos de caja con scroll infinito
    // ────────────────────────────────────────────────────────────── 

    const cargarMovimientos = useCallback(async (reiniciar: boolean = false) => {
        // Si no hay ID, o ya está cargando, frena (salvo que estemos forzando un reinicio)
        if (!state.dataCaja.id_caja || scrollState.loading) { return; }
        if (!reiniciar && !scrollState.hasMore) { return; } 

        setScrollState(prev => ({ ...prev, loading: true }));

        try {
            // Si reiniciamos, el offset vuelve a 0
            const currentOffset = reiniciar ? 0 : scrollState.offset;

            const dataDetalle = {
                id_caja: state.dataCaja.id_caja,
                limite: scrollState.limite,
                offset: currentOffset
            };

            const res = await config.servicios.movimientoCajaDetalle(dataDetalle);
            
            if (res.code === "MOVIMIENTOS_CAJA_OK" && Array.isArray(res.data) ) {
                setMovimientos(prev => reiniciar ? res.data : [...prev, ...res.data]);
                setScrollState(prev => ({
                    ...prev,
                    loading: false,
                    offset: (reiniciar ? 0 : prev.offset) + prev.limite,
                    hasMore: res.data.length === prev.limite
                }));
            } else {
                setScrollState(prev => ({ ...prev, loading: false, hasMore: false }));
            }
        } catch (error) {
            setScrollState(prev => ({ ...prev, loading: false }));
        }
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

    }, [scrollState.loading, scrollState.hasMore, cargarMovimientos, state.dataCaja.id_caja]);




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

    // ──────────────────────────────────────────────────────────────
    //  Handle para cachear observaciones cierre caja OK
    // ────────────────────────────────────────────────────────────── 

    const hanldeObsevacionesCierre = async( event: React.ChangeEvent<HTMLTextAreaElement>) =>{
    
        const valorObse : string = event.target.value;
        if ( valorObse ){
            dispatch({ type : "SET_OBSERVACIONES" , payload : event.target.value});
        }else{
            dispatch({ type : "SET_OBSERVACIONES" , payload : ""});
        };

    };


        // --- Registramos el movimiento INGRESO/EGRESO 
   
    const handRegistarMovimientoExtraordinario = async () => {
        try{
            dispatch({ type : "CARGA_MOVIEMENTO_EXTRAS", payload : true });
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
            
                    id_categoria  : Number(state.movimientoExtraordinario.id_categoria),
                    monto         : Number(state.movimientoExtraordinario.monto),
                    id_cuenta     : Number(state.movimientoExtraordinario.id_cuenta),

                    descripcion   : state.movimientoExtraordinario.descripcion,
                    referencia_id : 0       
                };
        

                const servicioApiFetch =config.servicios.registrarMovimientoCaja;
                const registroMovimientoResult = await servicioApiFetch(data); 


                if (registroMovimientoResult.code === "DETALLE_CAJA_OK") {

                    peticionComunicacion({
                        nombreCanal : "canal_actualizar_metricas_principal",
                        mensaje : "ACTUALIZAR_PANEL_PRINCIPAL",
                        dispatchError : disparchMetricas,
                        error :  'SET_ERROR_METRICAS_TARJETAS',
                    });

                    // Actualiza los registros del historial para reflejar la nueva actividad generada
                    peticionComunicacion({
                        nombreCanal : "canal_actualizar_metricas_historial",
                        mensaje : "ACTUALIZAR_HISTORIAL",
                        dispatchError : disparchMetricas,
                        error : 'SET_ERROR_HISTORIAL'
                    });

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
             

                    dispatch({ type : "RESET_MOVIMIENTO_EXTRA" , payload : ""});           

                    dispatch({ type : "CERRAR_MODALES_IE" })
                }else{
                
                    dispatch({
                        type : "SET_ERROR",
                        payload : registroMovimientoResult.message
                    });
                };
            };

        }catch( error ){
            dispatch({
                type : "SET_ERROR",
                payload : "Error en la carga en el servidor."
            });
        }finally{
           dispatch({ type : "CARGA_MOVIEMENTO_EXTRAS", payload : false });
        };    



    };




// ──────────────────────────────────────────────────────────────
//Obtener  los movimientos de caja para el detalle
// ────────────────────────────────────────────────────────────── 
useEffect(() => {
        if (state.dataCaja.id_caja) {
            // 1. Reseteamos el scroll state a offset 0 y hasMore true antes de cargar
            setScrollState(prev => ({
                ...prev,
                offset: 0,
                hasMore: true
            }));
            
            // 2. Llamamos a cargar pasando "true" para que limpie y traiga fresco
            cargarMovimientos(true);
        
        } else {
            setMovimientos([]);
            setScrollState({
                loading: false,
                hasMore: true,
                offset: 0,
                limite: 5
            });
        }
    }, [state.dataCaja.id_caja, state.actualizarCaja, state.disparadorRefresco]); 



// ──────────────────────────────────────────────────────────────
// Configuración de canales de comunicación para actualizar los movimientos de caja
// ──────────────────────────────────────────────────────────────  

useEffect( ()=>{
    
    const canalInscripcion = recepcionComunicacion({
        nombreCanal : "canal_inscripcion_caja",
        mensaje : "actualizar",
        dispatchError : dispatch,
        error : 'SET_ERROR_CANAL',
        dispatchActualizar : dispatch,
        actualizar : 'ACTUALIZAR_CAJA_GENERICO'
    });

    return () =>{
        if (canalInscripcion) canalInscripcion();
    };

}, []);

// ──────────────────────────────────────────────────────────────
// Hook para actualizar los movimientos de caja al recueprar el foco , tamb valida si el usuario sigue autenticado
// ──────────────────────────────────────────────────────────────   
    useActualizarAlEnfocar({ dispatchActualizar : dispatch , accion :  'ACTUALIZAR_CAJA_GENERICO'});

    return{
        lastElementRef,
        movimientos,
        scrollState,

        handleMovimientoExtraordinarioChange,
        handleTipoPagoChange,
        handleCerrarModalEgrIng,
        handRegistarMovimientoExtraordinario,
        handleMontoChange,
        handleMemoChange,
        hanldeObsevacionesCierre
    };


};


