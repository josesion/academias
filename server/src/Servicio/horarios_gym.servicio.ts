import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as HorariosGymData } from "../data/horarios_gym.data";
import { registroHistorial } from "../utils/postHistorial";

import * as TipadoHorarioGym from "../squemas/horarios_gym";
import { ResultCalendarioHorarioGym, ResultadoAltaHorarioGym, ResultModHorarioGym, ResultEliminarHorarioGym } from "../tipados/horarios_gym";
import { TipadoData } from "../tipados/tipado.data";
import { type HistorialInputs } from "../squemas/historial";

const servicioCalendarioGym = async( data : TipadoHorarioGym.HorarioGymCalendarioInput) 
: Promise<TipadoData<ResultCalendarioHorarioGym[]>> =>{

    const dataCalendario : TipadoHorarioGym.HorarioGymCalendarioInput = TipadoHorarioGym.CalendarioHorarioGymSchema.parse( data );

    const calendario  = await HorariosGymData.calendarioGym(dataCalendario);

    if ( calendario.code === "NO_ACTIVE_HORARIOS_GYM"){
        return {
            error: true,
            message: "No existen horarios asignados en el calendario",
            code: "CALENDARIO_GYM_VACIO"
        }
    };

    if ( calendario.code === 'HORARIOS_GYM_LISTED'){
        return {
            error: false,
            message: "Calendario del gym obtenido correctamente",
            data: calendario.data,
            code: "CALENDARIO_GYM_LISTADO"
        }
    };

    return {
        error: true,
        message: "Error al obtener el calendario",
        code: "ERROR_SERVIDOR"
    };
};

const servicioAltaGym = async( data : TipadoHorarioGym.HorarioGymInput) 
: Promise<TipadoData<ResultadoAltaHorarioGym>> =>{
    
    const dataGym : TipadoHorarioGym.HorarioGymInput = TipadoHorarioGym.HorarioGymSchema.parse(data);

    const salaOcupada = await HorariosGymData.verificarSalaHorarioGym( dataGym );

    if ( salaOcupada.code === 'HORARIOS_GYM_SALA_EXISTE'){
        return{
            error: true,
            message:`La sala ya tiene un horario asignado el dia ${data.dia_semana} de ${data.hora_inicio} a ${data.hora_fin}.`,
            code: "SALA_OCUPADA"            
        }
    };

    const profesorOcupado = await HorariosGymData.verificarProfesorGym( dataGym );
    if ( profesorOcupado.code === 'HORARIOS_GYM_PROFESOR_EXISTE' ){
        return {
            error : true ,
            message : `El profesor con DNI: ${data.dni_profesor} ya tiene una clase asignada.`,
            code : "PROFESOR_OCUPADO"
        };
    };

    const dataAlta = await HorariosGymData.altaHorarioGym( dataGym);

    if ( dataAlta.code === 'HORARIOS_GYM_CREAR') {

        const dataHistorial  : HistorialInputs = {
            id_escuela :  dataGym.id_escuela ,
            id_usuario :  dataGym.id_usuario,
            modulo : "HORARIOS",
            accion : "CREAR",
            id_registro: Number(dataAlta.data?.id),
            descripcion: `Se creó el horario de gym para la sala ${dataGym.id_sala} (${dataGym.hora_inicio} - ${dataGym.hora_fin}, ${dataGym.dia_semana})`,
            datos: {
                id_horario: dataAlta.data?.id,
                dni_profesor: dataGym.dni_profesor,
                id_sala: dataGym.id_sala,
                id_tipo_clase: dataGym.id_tipo_clase,
                hora_inicio: dataGym.hora_inicio,
                hora_fin: dataGym.hora_fin,
                dia_semana: dataGym.dia_semana,
            }
        }; 
        
        await registroHistorial( dataHistorial);   

        return {
            error : false,
            message : "Horario de gym creado con éxito",
            data : dataAlta.data,
            code : "HORARIO_GYM_CREADO"
        }
    };

    return {
        error : true ,
        message : `No se pudo crear el horario de gym`,
        code : "ERROR_SERVIDOR" 
    };
};

const servicioModGym = async ( data : TipadoHorarioGym.ModHorarioGymInput)
: Promise<TipadoData<ResultModHorarioGym>> =>{

    const dataMod : TipadoHorarioGym.ModHorarioGymInput = TipadoHorarioGym.ModHorarioGymSchema.parse(data);

    const horarioMod = await HorariosGymData.modHorarioGym(dataMod);

    if (horarioMod.code === 'HORARIOS_GYM_MODIFICAR'){
    
        const dataHistorial  : HistorialInputs = {
            id_escuela :  dataMod.id_escuela ,
            id_usuario :  dataMod.id_usuario,
            modulo : "HORARIOS",
            accion : "MODIFICAR",
            id_registro: Number(dataMod.id),
            descripcion: `Se modificó el horario de gym (ID: ${dataMod.id})`,
            datos: {
                id: dataMod.id, 
                dni_profesor: dataMod.dni_profesor,
                id_sala: dataMod.id_sala,
                id_tipo_clase: dataMod.id_tipo_clase,
            }
        }; 
        
        await registroHistorial( dataHistorial); 

        return{
            error : false,
            message : `El horario ${horarioMod.data?.id} se modifico`,
            data : horarioMod.data,
            code : "HORARIO_GYM_MODIFICADO"
        };
    }

    return {
        error : true ,
        message : `No se logro modificar el horario de gym`,
        code : "ERROR_SERVIDOR"        
    }
};

const servicioEliminarGym = async ( data : TipadoHorarioGym.EliminarHorarioGymInput)
: Promise<TipadoData<ResultEliminarHorarioGym>> =>{

    const dataElim : TipadoHorarioGym.EliminarHorarioGymInput = TipadoHorarioGym.EliminarHorarioGymSchema.parse(data);

    const horarioElim = await HorariosGymData.eliminarHorarioGym(dataElim);

    if (horarioElim.code === 'HORARIOS_GYM_ELIMINAR'){
    
        const dataHistorial  : HistorialInputs = {
            id_escuela :  dataElim.id_escuela ,
            id_usuario :  dataElim.id_usuario,
            modulo : "HORARIOS",
            accion : "ELIMINAR",
            id_registro: Number(dataElim.id),
            descripcion: `Se eliminó el horario de gym (ID: ${dataElim.id})`,
            datos: {
                id: dataElim.id,
                estado: dataElim.estado,
                vigente: dataElim.vigente,
            }
        }; 
        
        await registroHistorial( dataHistorial); 

        return{
            error : false,
            message : `El horario ${horarioElim.data?.id} se elimino`,
            data : horarioElim.data,
            code : "HORARIO_GYM_ELIMINADO"
        };
    }

    return {
        error : true ,
        message : `No se logro eliminar el horario de gym`,
        code : "ERROR_SERVIDOR"        
    }
};

export const method = {
    calendarioGym : tryCatchDatos( servicioCalendarioGym ),
    altaGym : tryCatchDatos( servicioAltaGym ),
    modGym : tryCatchDatos( servicioModGym ),
    eliminarGym : tryCatchDatos( servicioEliminarGym ),
};
