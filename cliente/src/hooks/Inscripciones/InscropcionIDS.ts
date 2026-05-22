
import { useEffect } from "react";
//hooks

//Reducer
import type { InscripcionTipado, InscripcionAcciones } from "../../reducers/inscripcionReducer";
import type { DataCajaDetalleIDs } from "../../tipadosTs/caja.typado";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface IDsInscripciones {

     servicios :{
        inscripcionCategoriaCaja     : ServicioCrud,
        obtenerIdCaja                : ServicioCrud,
     },
     state : InscripcionTipado,
     dispatch :  React.Dispatch<InscripcionAcciones>;
};

export const InscripcionIDS = ( config : IDsInscripciones) => {

    const { dispatch, state } = config;

  // ──────────────────────────────────────────────────────────────
  // Obtencion del id de Inscripcion predeterminado
  // ──────────────────────────────────────────────────────────────
    
  useEffect( () => {
      const obtenerIdInscipcion = async () => {
          const servicioApiFetch = config.servicios.inscripcionCategoriaCaja;
          const idCategoriaInscripcion = await servicioApiFetch( state.inscripcionData.id_escuela);   
              
          if ( idCategoriaInscripcion.code === "CATEGORIA_INSCRIPCION_OK" && idCategoriaInscripcion.data){
  
              dispatch({
                      type: "SET_MOVIMIENTOS_IDS", 
                      payload: { id_categoria: idCategoriaInscripcion.data.id_categoria } as DataCajaDetalleIDs
              });
          }else{
              dispatch({
                      type: "SET_MOVIMIENTOS_IDS", 
                      payload: { id_categoria: null } as DataCajaDetalleIDs
                  });           
          };
      };
      obtenerIdInscipcion();
  }, [] );  

  // ──────────────────────────────────────────────────────────────
  // Obtencion del estado de Caja predeterminado si es que esta abierta o no
  // ──────────────────────────────────────────────────────────────
    useEffect( () => {
        const obtenerIdCaja = async () =>{
            const servicioApiFetch = config.servicios.obtenerIdCaja;
            const idCajaAbierta = await servicioApiFetch(state.inscripcionData.id_escuela);
        
            if ( idCajaAbierta.code === "ID_CAJA_OK" && idCajaAbierta.data){
                dispatch({
                        type: "SET_MOVIMIENTOS_IDS", 
                        payload: { id_caja: idCajaAbierta.data.id_caja } as DataCajaDetalleIDs
                });
            }else{
                    dispatch({
                        type: "SET_MOVIMIENTOS_IDS", 
                        payload: { id_caja: null } as DataCajaDetalleIDs
                    });
            };
        }; 
        obtenerIdCaja();
    }, [state.modalInsc, state.inscripcionData.id_escuela]);

};