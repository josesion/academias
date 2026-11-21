import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataSalas } from "../data/salas.data"; 
import { registroHistorial } from "../utils/postHistorial";

import { TipadoData } from "../tipados/tipado.data";
import { ResulListSinPagSalaUsuarios } from "../tipados/sala.data";
import { CrearSalaSchema , ModificarSalaSchema, EstadoSalaSchema, ListaSalasUsuariosSchema,
         CrearSalaInput ,  ModificarSalaInput, EstadoSalaInput, ListadoSalaInput,
         ListadoSalaSinPagInput, ListaSalasUsuarioSinPagSchema
        } from "../squemas/salas";
import { type HistorialInputs } from "../squemas/historial";

const altaSala = async ( data : CrearSalaInput)
: Promise<TipadoData<{ nombre : string }>> => {
    
    const dataSala : CrearSalaInput = CrearSalaSchema.parse(data);

    const salaExiste = await dataSalas.salaNombreExiste( dataSala.nombre , dataSala.id_escuela );

    if ( salaExiste.code === "SALA_EXISTE" ){
        return {
            error : true,
            message : `La sala "${dataSala.nombre}" ya existe en esta escuela.`,
            code : "SALA_EXISTE"
        };
    };

    const nuevaSala = await dataSalas.altaSalaGlobal( dataSala );

    const dataHistorial  : HistorialInputs = {
        id_escuela :  dataSala.id_escuela ,
        id_usuario :  dataSala.id_usuario,
        modulo : "SALAS",
        accion : "CREAR",
        id_registro: Number( nuevaSala.data?.id),
        descripcion: `Creacion de sala: ${dataSala.nombre}`,
        datos: {
            id_sala : nuevaSala.data?.id,
            nombre : nuevaSala.data?.nombre
        }
    }; 
            
    await registroHistorial( dataHistorial); 

    if ( nuevaSala.code === "SALA_CREAR" ){
        return {
            error : false,
            message : "Se creo correctamente la sala",
            code : "SALA_ALTA_OK"
        };
    };

    return{
        error : true,
        message : "Error en el servidor, sala",
        code : "ERROR_SERVIDOR"
    };

};

const modSala = async ( dataM : ModificarSalaInput) 
: Promise<TipadoData<{ nombre : string}>> => {
   
    const dataSala : ModificarSalaInput = ModificarSalaSchema.parse( dataM );

    const existe = await dataSalas.salaExiste( dataSala.id , Number(dataSala.id_escuela));

    if ( existe.code !== "SALA_EXISTE" ) {
        return {
            error: true,
            message: "La sala no existe.",
            code: "SALA_NO_EXISTE"
        };
    }

    const duplicado = await dataSalas.salaNombreDuplicadoMod( dataSala.nombre , Number(dataSala.id_escuela) , dataSala.id );

    if ( duplicado.code === "SALA_EXISTE" ) {
        return {
            error: true,
            message: `La sala "${dataSala.nombre}" ya existe en esta escuela.`,
            code: "SALA_EXISTE"
        };
    }

   const salaModificada = await dataSalas.modificarSala( dataSala );   

   if( salaModificada.code === "SALA_MODIFICAR" ){

    const dataHistorial  : HistorialInputs = {
        id_escuela :  dataSala.id_escuela ,
        id_usuario :  dataSala.id_usuario,
        modulo : "SALAS",
        accion : "MODIFICAR",
        id_registro: Number( dataSala.id),
        descripcion: `Modificacion de sala: ${dataSala.nombre}`,
        datos: {
            id_sala : dataSala.id,
            nombre : dataSala.nombre
        }
    }; 
            
    await registroHistorial( dataHistorial); 

      return {
           error : false, 
           message : "Se modifico correctamente la sala",
           code : "MOD_SALA_OK"
      };  
   };

   return{
        error : true,
        message : "Error en el servidor, sala",
        code : "ERROR_SERVIDOR"
   };

}; 


const estadoSalaFunc = async ( estado : EstadoSalaInput)  
: Promise<TipadoData<{ id : number }>>  => {

    const dataSala : EstadoSalaInput = EstadoSalaSchema.parse( estado );

    const existe = await dataSalas.salaExiste( dataSala.id , Number(dataSala.id_escuela));

    if ( existe.code !== "SALA_EXISTE" ) {
        return {
            error: true,
            message: "La sala no existe.",
            code: "SALA_NO_EXISTE"
        };
    }

    const resultadoCambioEstado = await dataSalas.cambioEstado( dataSala );

    if ( resultadoCambioEstado.code === "SALA_MODIFICAR" ) {
        try {
            const accionHistorial = estado.estado === "activos" ? "RESTAURAR" : "ELIMINAR";
            const dataHistorial : HistorialInputs = {
                id_escuela : dataSala.id_escuela,
                id_usuario : dataSala.id_usuario,
                modulo : "SALAS",
                accion : accionHistorial,
                id_registro: Number( dataSala.id),
                descripcion: `Estado de sala ${existe.data?.nombre} cambio a ${estado.estado}`,
                datos: {
                    id_sala : dataSala.id,
                    estado : estado.estado
                }
            };
            await registroHistorial( dataHistorial );
        } catch {
            // El historial es secundario
        }

        return {
            error : false,
            message : "Se modifico el estado correctamente.",
            code : "ESTADO_SALA_OK"
        };
    }

    return {
        error : true,
        message : "Error en el servidor, sala.",
        code : "ERROR_SERVIDOR"
    };
};


const listadoSalas = async( listado : ListadoSalaInput )
: Promise<TipadoData<ResulListSinPagSalaUsuarios[]>> =>{

    const paramListado: ListadoSalaInput = ListaSalasUsuariosSchema.parse( listado ); 

    const dataListado = await dataSalas.listado( paramListado , Number(paramListado.pagina) );

    if ( dataListado.code === "SALA_LISTED") {
        return {
            error : false,
            message : "Listado de salas",
            data : dataListado.data,
            paginacion : dataListado.paginacion,
            code : "LISTADO_SALAS_OK"
        };
    };

    if ( dataListado.code === 'NO_ACTIVE_SALA') {
        return {
           error : true,
           message : "Sin listado de salas",
           code : "SIN_LISTADO_SALAS"            
        };
    };

    return{
         error : true,
         message : "Error en el servidor, sala",
         code : "ERROR_SERVIDOR"
    }; 

};


const listadoSalasSinPag = async(  listado :  ListadoSalaSinPagInput  ) =>{

    const paramListado: ListadoSalaSinPagInput = ListaSalasUsuarioSinPagSchema.parse( listado );

    const dataListado = await dataSalas.listadoSalasSinPag( paramListado );

    if ( dataListado.code === "SALA_LISTED") {
        return {
            error : false,
            message : "Listado de salas",
            data : dataListado.data,
            code : "LISTADO_SALAS_OK"
        };
    };    

    if ( dataListado.code === "NO_ACTIVE_SALA") {
         return {
           error : true,
           message : "Sin listado de salas",
           code : "SIN_LISTADO_SALAS"            
        };       
    };


    return{
         error : true,
         message : "Error en el servidor, sala",
         code : "ERROR_SERVIDOR"
    }; 

};


export const method = {
    altaSala : tryCatchDatos( altaSala ),
    modSala  : tryCatchDatos( modSala),
    estadoSala : tryCatchDatos( estadoSalaFunc ),
    listadoSalas : tryCatchDatos( listadoSalas ),
    listadoSalasSinPag : tryCatchDatos( listadoSalasSinPag ),
};
