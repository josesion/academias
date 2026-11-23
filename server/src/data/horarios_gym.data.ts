import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";

import { HorarioGymInput, HorarioGymCalendarioInput, ModHorarioGymInput, EliminarHorarioGymInput } from "../squemas/horarios_gym";
import { ResultadoAltaHorarioGym, ResultCalendarioHorarioGym, ResultModHorarioGym, ResultEliminarHorarioGym } from "../tipados/horarios_gym";
import { TipadoData } from "../tipados/tipado.data";

const verificarSalaHorarioGym = async( data : HorarioGymInput)
: Promise<TipadoData<{ id : number }>> =>{
    const {id_escuela, id_sala, dia_semana, hora_inicio, hora_fin} = data;

    const sql : string =`SELECT id
                         FROM horarios_gym
                         WHERE
                            id_escuela = ?
                            AND id_sala = ?
                            AND dia_semana = ?
                            AND estado = 'activos'
                            AND (
                                (hora_inicio < ? AND hora_fin > ?)
                            )
                            AND vigente = true;`;
    const valores : unknown[] = [ id_escuela, id_sala, dia_semana, hora_fin, hora_inicio ];  
    
    return await buscarExistenteEntidad<{ id : number}>({
        slqEntidad : sql,
        valores ,
        entidad : "horarios_gym_sala"
    });
};

const verificarProfesorGym = async( data : HorarioGymInput)
: Promise<TipadoData<{ id : number}>> =>{
    if (!data.dni_profesor) {
        return {
            error: false,
            message: "Profesor disponible",
            code: "HORARIOS_GYM_PROFESOR_NO_EXISTE"
        };
    }

    const {dni_profesor, dia_semana, hora_inicio, hora_fin} = data;

    const sql : string =`SELECT id
                         FROM horarios_gym
                         WHERE
                             dni_profesor = ?
                            AND dia_semana = ?
                            AND estado = 'activos'
                            AND (
                                (hora_inicio < ? AND hora_fin > ?)
                            )
                             AND vigente = true ;`;
    const valores : unknown[] = [ dni_profesor, dia_semana, hora_fin, hora_inicio ];  
    
    return await buscarExistenteEntidad<{ id : number}>({
        slqEntidad : sql,
        valores ,
        entidad : "horarios_gym_profesor"
    });
};

const altaHorarioGym = async( datos : HorarioGymInput ) 
: Promise<TipadoData<ResultadoAltaHorarioGym>> =>{

    const {id_escuela, dni_profesor, id_sala, id_tipo_clase,
        dia_semana, hora_inicio, hora_fin, fecha_creacion, estado
    } = datos;

    const sql : string =`INSERT INTO horarios_gym (
                                id_escuela, dni_profesor, id_sala, id_tipo_clase,
                                dia_semana, hora_inicio, hora_fin, fecha_creacion, estado)
                         VALUES
                            ( ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const valores : unknown[] = [id_escuela, dni_profesor, id_sala, id_tipo_clase,
                                 dia_semana, hora_inicio, hora_fin, fecha_creacion, estado];
    const datosADevolver = {
        id_escuela,
        dni_profesor,   
        id_sala,
        id_tipo_clase
    };

    return await iudEntidad<ResultadoAltaHorarioGym>({
        slqEntidad : sql,
        valores ,
        entidad : "horarios_gym",
        metodo : "CREAR",
        datosRetorno : datosADevolver
    });                            
};

const calendarioGym = async( datos : HorarioGymCalendarioInput)
: Promise<TipadoData<ResultCalendarioHorarioGym[]>> =>{
    const { id_escuela, estado } = datos;
    const sql : string = `SELECT 
                            hg.id AS id_horario,
                            hg.id_escuela,

                            p.nombre AS profesor_nombre,
                            p.apellido AS profesor_apellido,
                            hg.dni_profesor,

                            hg.id_sala,
                            s.nombre AS sala_nombre,

                            tc.tipo AS tipo_clase_descripcion,
                            hg.id_tipo_clase,

                            hg.dia_semana,
                            hg.hora_inicio,
                            hg.hora_fin,
                            hg.estado,
                            hg.fecha_creacion

                        FROM horarios_gym hg

                        LEFT JOIN profesores_en_escuela pe
                            ON pe.dni_profesor = hg.dni_profesor
                           AND pe.id_escuela = hg.id_escuela

                        LEFT JOIN profesores p
                            ON p.dni = hg.dni_profesor

                        JOIN salas s
                            ON s.id = hg.id_sala

                        LEFT JOIN tipo_clase tc
                            ON tc.id = hg.id_tipo_clase

                        WHERE hg.id_escuela = ? 
                        AND hg.estado IN ('activos', 'suspendido')
                        AND hg.vigente = true ;`;

    const valores : unknown[] = [id_escuela];

    return await listarEntidadSinPaginacion<ResultCalendarioHorarioGym>({
        slqListado : sql,
        valores ,
        entidad : "horarios_gym" ,
        estado : estado
    });
};

const modHorarioGym = async ( datos : ModHorarioGymInput ) 
: Promise<TipadoData<ResultModHorarioGym>> => {
    const {dni_profesor, id_sala, id_tipo_clase, id_escuela , id } = datos ;

    const sql : string = `UPDATE horarios_gym
                        SET
                            dni_profesor   =  ?,
                            id_sala        =  ?,
                            id_tipo_clase  =  ?
                        WHERE id = ?
                        AND id_escuela =  ?;`;

    const valores : unknown[] = [ dni_profesor, id_sala, id_tipo_clase, id, id_escuela  ];

    const datosRetorno = { dni_profesor, id_sala, id_tipo_clase, id, id_escuela };

    return await iudEntidad<ResultModHorarioGym>({
        slqEntidad : sql ,
        valores,
        datosRetorno, 
        entidad : "horarios_gym",
        metodo : "MODIFICAR"
    }); 
};

const eliminarHorarioGym = async ( data : EliminarHorarioGymInput)
: Promise<TipadoData<ResultEliminarHorarioGym>> =>{
    const  { estado , vigente, id_escuela , id } = data ;
    const sql : string = `UPDATE horarios_gym
                            SET
                                estado         =  ?,
                                vigente        =  ?
                            WHERE id = ?
                            AND id_escuela = ?;` ;

    const datosRetorno = {id , id_escuela, estado , vigente };
    const valores : unknown[] = [ estado , vigente , id , id_escuela];

    return await iudEntidad<ResultEliminarHorarioGym>({
        slqEntidad : sql,
        valores ,
        datosRetorno ,
        entidad : "horarios_gym",
        metodo : "ELIMINAR"
    });
};

export const method = {
    altaHorarioGym : tryCatchDatos( altaHorarioGym ),
    modHorarioGym  : tryCatchDatos ( modHorarioGym ),
    eliminarHorarioGym : tryCatchDatos( eliminarHorarioGym ),
    verificarSalaHorarioGym : tryCatchDatos( verificarSalaHorarioGym ),
    verificarProfesorGym : tryCatchDatos( verificarProfesorGym ),
    calendarioGym   : tryCatchDatos( calendarioGym),
};
