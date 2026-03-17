
// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidadTransaction } from "../hooks/iudEntidadTRansaccion";
import { listarEntidad } from "../hooks/funcionListar";
// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { InscripcionInputs , VerificacionInputs , 
         VerificarPlanAsistenciaUnputs, ResultInscripcionAsistencia,
         FiltroHistorialInputs,

 } from "../squemas/inscripciones";
import { DetalleCajaInputs } from "../squemas/cajas";
import { TipadoData } from "../tipados/tipado.data";
import { InscripcionListado } from "../tipados/inscripciones";



/**
 * Verifica si un alumno ya posee una inscripción con un estado específico (ej. 'activos')
 * en una escuela determinada.
 * * Esta función se usa para aplicar una regla de negocio que previene la duplicación
 * de inscripciones activas (evitando conflictos 409).
 *
 * @param {VerificacionInputs} data - Objeto con los datos clave para la verificación.
 * @param {number} data.dni_alumno - El DNI del alumno a verificar.
 * @param {number} data.id_escuela - El ID de la escuela donde se busca la inscripción.
 * @param {string} data.estado - El estado de la inscripción a buscar (ej: 'activos').
 * @returns {Promise<TipadoData<{id_inscripcion: number }>>} Una promesa que resuelve con
 * un objeto que contiene el ID de la inscripción si existe, o null/undefined
 * si no se encuentra (dependiendo de la implementación de buscarExistenteEntidad).
 */

const verificacion = async( data : VerificacionInputs ) 
: Promise<TipadoData<{id_inscripcion: number }>> => {
     const {dni_alumno , id_escuela , estado} = data;

    const sql : string = `select id_inscripcion from inscripciones 
                          where 
                             dni_alumno = ? and estado = ? and id_escuela = ? ;`;
    const valores : unknown[] = [dni_alumno , estado , id_escuela]; 

    return await buscarExistenteEntidad<{id_inscripcion: number }>({
        slqEntidad : sql,
        valores ,
        entidad : 'Inscripcion'
    });
};

/**
 * Registra una nueva inscripción en la base de datos con todos los detalles
 * del plan (snapshot) y las fechas.
 * * @param {InscripcionInputs} data - Objeto con todos los campos necesarios para la nueva inscripción.
 * @param {number} data.id_plan - ID del plan asociado a la inscripción.
 * @param {number} data.id_escuela - ID de la escuela donde se registra la inscripción.
 * @param {number} data.dni_alumno - DNI del alumno inscrito.
 * @param {string} data.fecha_inicio - Fecha de inicio de la inscripción (AAAA-MM-DD).
 * @param {string | null | undefined} data.fecha_fin - Fecha de fin de la inscripción (AAAA-MM-DD), puede ser nulo.
 * @param {number} data.monto - Monto pagado por el plan (snapshot del precio).
 * @param {number} data.clases_asignadas_inscritas - Número de clases asignadas (snapshot).
 * @param {number} data.meses_asignados_inscritos - Número de meses asignados (snapshot).
 * @returns {Promise<TipadoData<{ id_plan: number, dni_alumno: number }>>} Una promesa que resuelve con
 * el ID del plan y el DNI del alumno para confirmar la creación.
 */

const registroInscripcion = async( data : InscripcionInputs) 
: Promise<TipadoData<{ id_plan : number , dni_alumno : number }>> =>{

    

    const { id_plan, id_escuela ,dni_alumno ,fecha_inicio ,fecha_fin ,
            clases_asignadas_inscritas , meses_asignados_inscritos ,monto
    } = data ;


 
    const sql : string = `INSERT INTO inscripciones (
                            id_plan, 
                            id_escuela, 
                            dni_alumno, 
                            fecha_inicio, 
                            fecha_fin, 
                            monto, 
                            clases_asignadas_inscritas, 
                            meses_asignados_inscritos
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?, ?, ?
                        );`;
    const valores : unknown[] = [id_plan,id_escuela, dni_alumno , fecha_inicio ,fecha_fin ,monto , clases_asignadas_inscritas , meses_asignados_inscritos];
    const datosRetorno  = { id_plan , dni_alumno }

    return await iudEntidad<{ id_plan : number , dni_alumno : number }>({
        slqEntidad : sql,
        valores ,
        entidad : "Inscripciones",
        metodo  : "CREAR",
        datosRetorno : datosRetorno
    });

};

export const inscripcionConPagoAlta = async (
    dataInsc: InscripcionInputs, 
// 'Omit' crea un tipo nuevo basado en DetalleCajaInputs pero ELIMINA 'referencia_id'.
// Hacemos esto porque el ID de la inscripción todavía no existe (se genera después del primer INSERT),
// así evitamos que TypeScript nos tire error por "falta de campo obligatorio" al recibir los datos.
    dataCaja: Omit<DetalleCajaInputs, 'referencia_id'> 
) => {
    
    // 1. Definimos las SQL (las mismas que ya tenés)
    const sqlInsc = `INSERT INTO inscripciones (id_plan, id_escuela, dni_alumno, fecha_inicio, fecha_fin, monto, clases_asignadas_inscritas, meses_asignados_inscritos) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
    const sqlCaja = `INSERT INTO detalle_caja (id_caja, id_categoria, monto, metodo_pago, descripcion, referencia_id) VALUES (?, ?, ?, ?, ?, ?);`;

    const resultado = await iudEntidadTransaction(async (conn) => {
        
        // PASO A: Crear la inscripción
        const valoresInsc = [
            dataInsc.id_plan, dataInsc.id_escuela, dataInsc.dni_alumno, 
            dataInsc.fecha_inicio, dataInsc.fecha_fin, dataInsc.monto, 
            dataInsc.clases_asignadas_inscritas, dataInsc.meses_asignados_inscritos
        ];
        
        const [resInsc] = await conn.execute(sqlInsc, valoresInsc);
        const idGenerado = (resInsc as any).insertId;

        // PASO B: Crear el detalle de caja usando el ID de la inscripción
        const valoresCaja = [
            dataCaja.id_caja, 
            dataCaja.id_categoria, 
            dataCaja.monto, 
            dataCaja.metodo_pago, 
            dataCaja.descripcion, 
            idGenerado // <--- Aquí vinculamos el dinero con la inscripción
        ];

        await conn.execute(sqlCaja, valoresCaja);

        return { id_inscripcion: idGenerado, dni_alumno: dataInsc.dni_alumno };
    });

    if (resultado.code ===  "TRANSACCION_OK" ){
        return {
            error : false,
            message : "Inscripcion registrada correctamente",
            data : resultado.data,
            code : "TRANSACCION_OK"
        };
    };

    return {
            error : true,
            message : "Transaccion fallida",
            code : "TRANSACCION_FALLIDA"
    };    

};

/**
 * Consulta la vigencia de la inscripción y calcula el saldo de clases disponibles.
 * * Esta función realiza un cálculo dinámico cruzando la inscripción con el histórico 
 * de asistencias para determinar cuántos créditos le quedan al alumno.
 * * @param {VerificarPlanAsistenciaUnputs} data
 * Objeto con los criterios de búsqueda:
 * - dni_alumno: Documento del alumno a consultar.
 * - estado: Estado de la inscripción (ej: 'activos').
 * - id_escuela: Identificador de la institución.
 * * @returns {Promise<TipadoData<ResultInscripcionAsistencia>>}
 * Retorna una promesa con el resultado de `buscarExistenteEntidad`:
 * - id_inscripcion: ID único del plan contratado.
 * - vencimiento: Fecha de fin del plan formateada como 'YYYY-MM-DD'.
 * - clases_restantes: Resultado de (clases totales - asistencias consumidas).
 * * @remarks
 * - Utiliza `DATE_FORMAT` para evitar problemas de conversión de zona horaria en el cliente.
 * - Emplea un `LEFT JOIN` para asegurar que el cálculo funcione incluso si el alumno posee 0 asistencias.
 * - Requiere `GROUP BY` debido a la función de agregación `COUNT`.
 * * @sqlLogic
 * El saldo de clases se calcula mediante la fórmula:
 * `(clases_por_mes * meses_contratados) - asistencias_registradas`
 */
const verificarPlanAsistencia = async( data : VerificarPlanAsistenciaUnputs)
: Promise<TipadoData<ResultInscripcionAsistencia>> => {
    const {dni_alumno ,estado ,id_escuela, } = data;
    const sql : string = `SELECT 
                                i.id_inscripcion,
                                DATE_FORMAT(i.fecha_fin, '%Y-%m-%d') AS vencimiento,
                                ((i.clases_asignadas_inscritas * i.meses_asignados_inscritos) - COUNT(a.id_asistencia)) AS clases_restantes
                            FROM inscripciones i
                            LEFT JOIN asistencias a 
                                ON i.id_inscripcion = a.id_inscripcion
                            WHERE 
                                i.dni_alumno = ?
                                AND i.estado = ? 
                                AND i.id_escuela = ?
                            GROUP BY i.id_inscripcion;`;
    const valores : unknown[] = [ dni_alumno, estado , id_escuela];
    return await buscarExistenteEntidad<ResultInscripcionAsistencia>({
        slqEntidad : sql,
        valores ,
        entidad : "inscripcion"
    });
};

/**
 * Obtiene el listado de inscripciones con conteo de asistencias y paginación.
 * * @async
 * @function listadoInscripciones
 * @param {Object} data - Objeto con los filtros de búsqueda.
 * @param {number} data.id_escuela - ID de la escuela/academia.
 * @param {string} data.fecha_desde - Fecha de inicio del rango (YYYY-MM-DD).
 * @param {string} data.fecha_hasta - Fecha de fin del rango (YYYY-MM-DD).
 * @param {string} data.estado - Estado de la inscripción a excluir (ej: 'suspendido').
 * @param {number} data.limit - Cantidad de registros por página.
 * @param {number} data.offset - Desplazamiento de registros para la paginación.
 * @param {string} pagina - El número de página actual (usado para el retorno de metadata).
 * * @returns {Promise<TipadoData<InscripcionListado[]>>} Objeto estandarizado con la data, error y paginación.
 * * @example
 * const inscripciones = await listadoInscripciones(misInputs, "1");
 */
const listadoInscripciones = async ( data : FiltroHistorialInputs, pagina : string) 
: Promise<TipadoData<InscripcionListado[]>> =>{
  const { id_escuela, fecha_desde, fecha_hasta , estado, limit, offset , nombre_alumno, dni_alumno} = data ;   
  const dniFiltro = `%${dni_alumno}%`;
  const nombreFiltro = `%${nombre_alumno}%`;
  let estadoFiltro : string;

  if (estado === "todos" ) {
     estadoFiltro = `%%`
  }else{
      estadoFiltro = `%${estado}%`;
  }; 

  const sql : string = `SELECT 
                            i.id_inscripcion,
                            a_alumno.dni_alumno,
                            CONCAT(a_alumno.nombre, ' ', a_alumno.apellido) AS nombre_completo,
                            COALESCE(pe.nombre_personalizado, p.descripcion_plan) AS nombre_plan,
                            COUNT(asist.id_asistencia) AS clases_usadas,
                            (i.clases_asignadas_inscritas * i.meses_asignados_inscritos) AS clases_totales,
                            DATE_FORMAT(i.fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
                            DATE_FORMAT(i.fecha_fin, '%Y-%m-%d') AS vigencia,
                            i.monto AS monto_pagado,
                            (SELECT dc.metodo_pago 
                            FROM detalle_caja dc 
                            WHERE dc.referencia_id = i.id_inscripcion 
                            ORDER BY dc.id_movimiento DESC LIMIT 1) AS metodo_pago,
                            
                            -- Columna para la paginación de tu función listarEntidad
                            COUNT(*) OVER() AS total_registros

                        FROM inscripciones i
                        JOIN alumnos a_alumno ON i.dni_alumno = a_alumno.dni_alumno
                        JOIN planes_pago p ON i.id_plan = p.id_plan
                        LEFT JOIN planes_en_escuela pe ON (i.id_plan = pe.id_plan AND i.id_escuela = pe.id_escuela)
                        LEFT JOIN asistencias asist ON asist.id_inscripcion = i.id_inscripcion AND asist.estado = 'presente'
                        WHERE i.id_escuela = ? 
                        AND i.fecha_inicio BETWEEN ? AND ? 
                        AND i.estado LIKE ?
                        AND (
                                CONCAT(a_alumno.nombre, ' ', a_alumno.apellido) LIKE ? 
                                and a_alumno.dni_alumno LIKE ?
                            )

                        GROUP BY i.id_inscripcion
                        ORDER BY i.fecha_inicio DESC
                                    limit ${limit}
                                    offset ${offset};`;

                   
  const valores : unknown []  = [id_escuela , fecha_desde, fecha_hasta, estadoFiltro, nombreFiltro, dniFiltro];// por defecto todos estado                     
  return listarEntidad({
        slqListado : sql,
        valores,
        limit, 
        pagina,
        entidad : "Inscripciones",
        estado  : estado
  });    
};

export const method = {
    alta  : tryCatchDatos( registroInscripcion ), 
    verificacion : tryCatchDatos( verificacion ),
    verificarPlanAsistencia : tryCatchDatos(  verificarPlanAsistencia ), 
    inscripcionConPagoAlta : tryCatchDatos( inscripcionConPagoAlta ),
    listadoInscripciones   : tryCatchDatos( listadoInscripciones ),
};