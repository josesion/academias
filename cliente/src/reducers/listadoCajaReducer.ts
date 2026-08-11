

export interface ListadoCajas{
    modal :{
        libroDiario : boolean
    }
};


export const initialStateListadoCaja = () : ListadoCajas =>({
    modal : { libroDiario : false}
});


export type ListadoCajaAction =
   | { type : "SET_MODAL_LIBRO_DIARIO" , payload : boolean}



export const listadoCajaReducer = ( state : ReturnType< typeof initialStateListadoCaja>, action : ListadoCajaAction )
: ReturnType< typeof initialStateListadoCaja> =>{

    switch( action.type ){
        case "SET_MODAL_LIBRO_DIARIO" :
            return {
                ...state , 
                modal : {
                    libroDiario : action.payload
                }}
    };

};   