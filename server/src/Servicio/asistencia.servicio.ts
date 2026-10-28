// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";

import { method as asistenciaData, ListadoAsistenciaRow } from "../data/asistencia.data";
import { method as inscripcionData } from "../data/inscripciones.data";
import { method as horarioData  } from "../data/horarios.data"
// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { TipadoData } from "../tipados/tipado.data"; 
import { VerificarInscripcionInput, VerificarInscripcionSchema,  } from "../squemas/inscripciones";
import { 
         AsistenciaInputs, AsistenciaSchema, 
         ClasesActualInputs,ClaseActualSchema, 
         ClaseProximaSchema, ClasesProximaInputs,
         InfoAlumnoSchema, InfoAlumnoInputs,
         AsistenciaManualSchema, AsistenciaManualInputs,
          BuscarAlumnoSchema, BuscarAlumnoInputs,
          ListadoAsistenciasSchema, ListadoAsistenciasInputs,
       } from "../squemas/asistencias"; 

import { DataAlumnoVigenteInputs, DataAlumnoVigenteSchema, } from "../squemas/horarios_clases";       
import {  ResulClases_curso_proxima, ResultadoClaseEnCruso , ResultadoClaseProxima ,ResultErrorAsistencia, ResultDataAsistencia, InfoAlumnoResult } from "../tipados/asistencia.tipado";







/**
 * Registra una asistencia para un alumno en una clase específica y
 * actualiza el estado de la inscripción si corresponde.
 *
 * Esta operación se ejecuta dentro de una transacción para garantizar
 * la integridad de los datos.
 *
 * Flujo interno:
 * 1. Inserta la asistencia del alumno para el día actual (CURDATE).
 * 2. Calcula la cantidad de clases restantes de la inscripción.
 * 3. Si las clases restantes llegan a 0 o menos, marca la inscripción como "vencidos".
 * 4. Confirma la transacción si todo sale bien, o hace rollback ante cualquier error.
 *
 * @param {VerificarInscripcionInput} verificacion
 * Datos necesarios para validar la inscripción activa del alumno.
 * Incluye:
 * - id_escuela
 * - dni_alumno
 * - id_inscripcion
 *
 * @param {AsistenciaInputs} asistencia
 * Datos propios de la asistencia a registrar.
 * Incluye:
 * - id_horario_clase
 *
 * @returns {Promise<TipadoData<{ idAsistencia: number, clasesRestantes: number }>>}
 * Retorna un objeto tipado con el resultado de la operación.
 *
 * @returns.code TRANSACCION_OK
 * La asistencia fue registrada correctamente.
 * Se devuelve:
 * - idAsistencia: ID generado de la asistencia
 * - clasesRestantes: cantidad de clases disponibles luego del registro
 *
 * @returns.code TRANSACCION_FALLIDA
 * Ocurrió un error durante la transacción y no se aplicaron cambios.
 *
 * @remarks
 * - La función asume que todas las validaciones previas ya fueron realizadas:
 *   - Inscripción existente y activa
 *   - No doble asistencia en el mismo día
 *   - Horario dentro de la ventana permitida
 * - La lógica de vencimiento de inscripción depende exclusivamente
 *   del cálculo de clases restantes.
 * - El uso de transacciones evita estados inconsistentes ante errores intermedios.
 *
 * @example
 * // Resultado exitoso
 * {
 *   error: false,
 *   message: "Asistencia registrada correctamente",
 *   data: {
 *     idAsistencia: 123,
 *     clasesRestantes: 5
 *   },
 *   code: "TRANSACCION_OK"
 * }
 */
const altaAsistencia = async( verificacion : VerificarInscripcionInput , asistencia : AsistenciaInputs ) 
: Promise<TipadoData<{idAsistencia : number, clasesRestantes : number}>>=> {
   
    const dataVerificacionInsc : VerificarInscripcionInput = VerificarInscripcionSchema.parse(verificacion);
    const dataAsistencia : AsistenciaInputs = AsistenciaSchema.parse(asistencia);
    // console.log(dataAsistencia)
    // console.log(dataVerificacionInsc)

    const verificarInsc  = await asistenciaData.verificarInscripcion( dataVerificacionInsc );
   // console.log(verificarInsc)

    switch (verificarInsc.code){
        case  'INSCRIPCION_NO_EXISTE' : {
            //  si no existe quiere decir q ya se vencio por alguna razon 
            return {
                error: true,
                message : `El alumno :${verificacion.dni_alumno} no tiene plan activo`,
                code : "INSCRIPCION_NO_EXISTE"
            };
        };

        case  'INSCRIPCION_EXISTE' : {
              //logica de ventana de horario
            const ventanaTiempo = await asistenciaData.ventanaAsistencia( dataAsistencia.id_horario_clase);
            //console.log("ventana",ventanaTiempo)
            if( ventanaTiempo.code === 'HORARIO_NO_EXISTE' ){
                // se esta queirendo inscribir  en un horario q no existe o fuera de la ventana de tiempo permitida 
                return {
                    error : true,
                    message :"No estás dentro del horario permitido para marcar asistencia",
                    code : "FUERA_DE_VENTANA_HORARIA"
                };    
            };
            if( ventanaTiempo.code === 'HORARIO_EXISTE' ){
                const verificarDobleAsistencia = await asistenciaData.dobleAsitencia(dataVerificacionInsc.id_inscripcion , dataAsistencia.id_horario_clase);
            
                if( verificarDobleAsistencia.code === "ASISTENCIA_EXISTE" ){
                    return {
                        error : true,
                        message : `El alumno : ${ dataVerificacionInsc.dni_alumno } ya esta en clase`,
                        code : "ALUMNO_EN_CLASE"
                    };
                };
                if( verificarDobleAsistencia.code === "ASISTENCIA_NO_EXISTE" ){
                    const asistenciaResultado = await asistenciaData.asistencia( dataVerificacionInsc, dataAsistencia);
        
                    if (asistenciaResultado.code === "TRANSACCION_FALLIDA"){
                        return {
                            error : true,
                            message : `Error, falla en la transaccion en consultas`,
                            code : "TRANSACCION_FALLIDA"
                        };
                    };
                    if (asistenciaResultado.code === "TRANSACCION_OK"){
                        return {
                            error : false,
                            message : `Asistencia correcta del alumno :${verificacion.dni_alumno} `,
                            data : asistenciaResultado.data,
                            code  : "ASISTENCIA_OK"
                        };
                    };
                };
            };

        };

      default:{
            return {
                error : true,
                message : "No se Logro generar la asistencia",
                code   :"ERROR_SERVIDOR"
            };        
      };    
    };

}; 

/**
 * Obtiene la información de asistencia correspondiente al día actual:
 * - Clase que se encuentra actualmente en curso (si existe).
 * - Próxima clase a dictarse en el mismo día (si existe).
 *
 * La función determina automáticamente el día de la semana actual
 * utilizando el reloj del servidor y realiza dos consultas:
 *
 * 1️ Clase en curso:
 *    - Busca una clase cuyo horario incluya la hora actual (`NOW()`).
 *    - Contempla rangos normales y rangos que cruzan medianoche.
 *
 * 2️ Próxima clase:
 *    - Busca la clase con la hora de inicio más cercana posterior a la hora actual.
 *
 *  Consideraciones importantes:
 * - La información depende exclusivamente del tiempo actual del servidor.
 * - No se cachea el resultado.
 * - Está pensada para ser ejecutada cada vez que se necesita mostrar
 *   el estado real de la asistencia (evita información obsoleta).
 * - Solo evalúa clases del día actual.
 *
 * @param data - Datos base para la consulta de asistencia.
 * @param data.id_escuela - Identificador de la escuela.
 * @param data.estado - Estado de los horarios a evaluar (ej: activo).
 *
 * @returns Promesa con un objeto `TipadoData` que contiene:
 * - `data.enCursoClase`: Clase actualmente en curso o un objeto de error.
 * - `data.proximaClase`: Próxima clase del día o un objeto de error.
 * - `code`: Código de resultado general.
 * - `message`: Mensaje descriptivo del resultado.
 *
 * @example
 * ```ts
 * const resultado = await fechaAsistencia({
 *   id_escuela: 5,
 *   estado: "activo"
 * });
 *
 * if (resultado.code === "CURSANDO_PROXIMA_CLASES_OK") {
 *   console.log(resultado.data.enCursoClase);
 *   console.log(resultado.data.proximaClase);
 * }
 * ```
 */
const fechaAsistencia = async( data : ClasesActualInputs)
: Promise<TipadoData<ResulClases_curso_proxima>> =>{
    
    const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    const diaHoy = dias[new Date().getDay()];  

    const verificacionFechas_en_curso : ClasesActualInputs =ClaseActualSchema.parse({id_escuela : data.id_escuela, estado : data.estado , dia : diaHoy});
    const clase_en_curso  = await asistenciaData.claseEnCurso(verificacionFechas_en_curso);
  
    let clase_actual : ResultadoClaseEnCruso | ResultErrorAsistencia = { error : null , message : null , code : null};
    let clase_proxima : ResultadoClaseProxima | ResultErrorAsistencia = { error : null , message : null , code : null};

    switch (clase_en_curso.code){
        case 'CLASE_EN_CURSO_NO_EXISTE' : {
            clase_actual = {
                error : true,
                message: "No se registra ninguna clase en curso",
                code  : "NO_HAY_CLASES_EN_CURSO"
            };
        };
        case 'CLASE_EN_CURSO_EXISTE'    : {
            if (clase_en_curso.data) clase_actual  = clase_en_curso.data  ;
        };

    };
   
  const verificaionFechas_proxima_clase : ClasesProximaInputs = ClaseProximaSchema.parse({ id_escuela : data.id_escuela, estado : data.estado , dia : diaHoy }); 
  const proxima_Clase = await asistenciaData.proximaClase(verificaionFechas_proxima_clase);  
 
  switch ( proxima_Clase.code){
    case "PROXIMA_CLASE_NO_EXISTE" : {
        clase_proxima = {
            error : true,
            message: "No se registra ninguna proxima clase",
            code  : "NO_HAY_PROXIMA_CLASE"
        };
    };
    case "PROXIMA_CLASE_EXISTE" : {
        if (proxima_Clase.data) clase_proxima = proxima_Clase.data
    };
    
  };


 
  return{
    error: false,
    message : "Resultado de clases acutal y proxima",
    data :{ 
        enCursoClase : clase_actual,
        proximaClase : clase_proxima
    },
    code : "CURSANDO_PROXIMA_CLASES_OK"
  };
};


/**
 * Servicio de lógica de negocio para validar la vigencia de un alumno y su horario.
 * * Coordina la verificación de dos reglas críticas:
 * 1. Existencia de un plan activo en la base de datos.
 * 2. Existencia de una clase programada cuya ventana de acreditación coincida con NOW().
 * * @param {DataAlumnoVigenteInputs} data
 * Objeto con los criterios de búsqueda: id_escuela, dni_alumno y estado.
 * * @returns {Promise<TipadoData<ResultDataAsistencia>>}
 * Objeto con el código de resultado, mensaje y el payload con `dataHorario` e `dataInscripcion`.
 * * @remarks
 * - Utiliza `DataAlumnoVigenteSchema` para validar la integridad de los inputs antes de operar.
 * - Calcula dinámicamente el día de la semana para segmentar la búsqueda del horario.
 * - La ventana de tiempo permitida es: [hora_inicio - 15min] hasta [hora_inicio + 30min].
 * * @codeResult
 * - ASISTENCIA_OK: Validación exitosa.
 * - INSCRIPCION_NO_EXISTE: El alumno no tiene planes vigentes.
 * - HORARIO_NO_EXISTE: No hay clases disponibles para acreditar en este momento.
 */
export const dataAsistenciaServicio = async( data : DataAlumnoVigenteInputs) 
: Promise<TipadoData<ResultDataAsistencia>> => {
     const { id_escuela , dni_alumno, estado} = data;

     const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
     const diaHoy = dias[new Date().getDay()];


    // primero verifico si tiene plan activos
    const verificardata : DataAlumnoVigenteInputs = DataAlumnoVigenteSchema.parse({ id_escuela : id_escuela , dni_alumno : dni_alumno , estado : estado , dia : diaHoy });
    const planResult = await inscripcionData.verificarPlanAsistencia(verificardata);

    if ( planResult.code === 'INSCRIPCION_NO_EXISTE' ){
        return {
            error : true,
            message : `El alumno :${data.dni_alumno} no tiene plan activo`,
            code : "INSCRIPCION_NO_EXISTE"
        };
    }; 
    if ( planResult.code === 'INSCRIPCION_EXISTE' ){
 
        // segundo veo si exsite una horario justo en el momento actual
        const dataAsisntenciaResult = await horarioData.dataHorarioAsistencia(verificardata);

        if ( dataAsisntenciaResult.code === "HORARIO_ASISTENCIA_EXISTE"){
            return {
                error : false,
                message : "Horario de clase en curso",
                data  : {
                    dataHorario : { id_horario_clase : dataAsisntenciaResult.data!.id_horario_en_clase,
                                    hora_inicio : dataAsisntenciaResult.data!.hora_inicio,
                                    hora_fin : dataAsisntenciaResult.data!.hora_fin,
                                    nombre_clase : dataAsisntenciaResult.data!.nombre_clase},

                    dataInscripcion : { id_inscripcion : planResult.data!.id_inscripcion,
                                        vencimiento : planResult.data!.vencimiento,
                                        clases_restantes : planResult.data!.clases_restantes,}                
                },
                code  : "ASISTENCIA_OK"
            };
        };
        if ( dataAsisntenciaResult.code === "HORARIO_ASISTENCIA_NO_EXISTE"){
            return {
                error : true,
                message : "No hay un horario de clase",
                code  : "HORARIO_NO_EXISTE"
            };
        };
        
    }; 
    
    return {
        error : true,
        message : "Error en el servidor durante el proceso se asistencia ",
        code : "ERROR_SERVIDOR"
    };

};

/**
 * Servicio de info de alumno.
 */
const infoAlumnoServicio = async ( data : InfoAlumnoInputs )
: Promise<TipadoData<InfoAlumnoResult>> => {
    const parsed : InfoAlumnoInputs = InfoAlumnoSchema.parse(data);
    const result = await asistenciaData.infoAlumno(parsed);
    if (result.code === "INSCRIPCION_EXISTE") {
        return {
            error : false,
            message : "Info alumno obtenida",
            data : result.data,
            code : "INFO_ALUMNO_OK"
        };
    }
    return {
        error : true,
        message : "El alumno no tiene plan activo",
        code : "INFO_ALUMNO_NO_EXISTE"
    };
};

/**
 * Registra una asistencia **manual** (spec 043).
 *
 * Reglas distintas del kiosko (`/api/asistencia`):
 * - **No** exige la ventana horaria (15 min antes / 30 min después del inicio).
 * - Sólo admite registrar en **la clase que está en curso** o **la que sigue**.
 * - Sí bloquea la **doble asistencia**: si el alumno ya marcó esta clase hoy,
 *   no se vuelve a registrar.
 *
 * @param {AsistenciaManualInputs} asistencia - Datos de la asistencia a
 *   registrar (alumno, inscripción, escuela, estado y el horario de clase).
 *
 * @returns {Promise<TipadoData<{ idAsistencia: number, clasesRestantes: number }>>}
 *   Resultado tipado de la operación.
 *
 * @returns.code ASISTENCIA_OK - La asistencia quedó registrada.
 * @returns.code INSCRIPCION_NO_EXISTE - El alumno no tiene plan activo.
 * @returns.code CLASE_NO_PERMITIDA - La clase no es la de ahora ni la próxima.
 * @returns.code ALUMNO_EN_CLASE - El alumno ya marcó esta clase hoy.
 */
const altaAsistenciaManual = async( asistencia : AsistenciaManualInputs )
: Promise<TipadoData<{idAsistencia : number, clasesRestantes : number}>> => {

    // Un solo objeto de entrada: es lo que espera `handleControladores`
    // (el servicio se invoca con `servicio(parametros)`).
    const dataAsistencia : AsistenciaManualInputs = AsistenciaManualSchema.parse(asistencia);

    const dataVerificacionInsc : VerificarInscripcionInput = VerificarInscripcionSchema.parse({
        id_inscripcion : dataAsistencia.id_inscripcion,
        dni_alumno : dataAsistencia.dni_alumno,
        id_escuela : dataAsistencia.id_escuela,
        estado : dataAsistencia.estado,
    });

    const verificarInsc = await asistenciaData.verificarInscripcion( dataVerificacionInsc );

    switch (verificarInsc.code){
        case 'INSCRIPCION_NO_EXISTE' : {
            return {
                error: true,
                message : `El alumno :${dataAsistencia.dni_alumno} no tiene plan activo`,
                code : "INSCRIPCION_NO_EXISTE"
            };
        };

        case 'INSCRIPCION_EXISTE' : {
            // La asistencia manual no usa la ventana horaria del kiosko:
            // sólo se puede marcar la clase de ahora o la que sigue.
            // El dia de la semana lo calcula el servidor (no viene del body).
            const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
            const diaHoy = dias[new Date().getDay()];

            const horarioValido = await asistenciaData.horarioEnCursoOProxima({
                id_escuela : dataAsistencia.id_escuela,
                estado : dataAsistencia.estado,
                dia : diaHoy,
                id_horario_clase : dataAsistencia.id_horario_clase,
            });

            if( horarioValido.code === 'HORARIO_NO_EXISTE' ){
                return {
                    error : true,
                    message : "Sólo se puede registrar asistencia en la clase que está en curso o en la próxima",
                    code : "CLASE_NO_PERMITIDA"
                };
            };

            const verificarDobleAsistencia = await asistenciaData.dobleAsitencia( dataVerificacionInsc.id_inscripcion , dataAsistencia.id_horario_clase);

            if( verificarDobleAsistencia.code === "ASISTENCIA_EXISTE" ){
                return {
                    error : true,
                    message : `El alumno : ${ dataVerificacionInsc.dni_alumno } ya tiene asistencia en esta clase`,
                    code : "ALUMNO_EN_CLASE"
                };
            };

            const asistenciaResultado = await asistenciaData.asistencia( dataVerificacionInsc, { id_horario_clase : dataAsistencia.id_horario_clase });

            if (asistenciaResultado.code === "TRANSACCION_FALLIDA"){
                return {
                    error : true,
                    message : "Error, falla en la transaccion en consultas",
                    code : "TRANSACCION_FALLIDA"
                };
            };

            if (asistenciaResultado.code === "TRANSACCION_OK"){
                return {
                    error : false,
                    message : `Asistencia correcta del alumno :${dataAsistencia.dni_alumno} `,
                    data : asistenciaResultado.data,
                    code  : "ASISTENCIA_OK"
                };
            };
        };

        default:{
            return {
                error : true,
                message : "No se Logro generar la asistencia",
                code   :"ERROR_SERVIDOR"
            };
        };
    };
};

/**
 * Servicio de búsqueda de alumnos por nombre, apellido o DNI.
 */
const buscarAlumnoServicio = async ( data : BuscarAlumnoInputs )
: Promise<TipadoData<InfoAlumnoResult[]>> => {
    const parsed : BuscarAlumnoInputs = BuscarAlumnoSchema.parse(data);
    const result = await asistenciaData.buscarAlumno(parsed);
    // El hook de listado devuelve INSCRIPCION_LISTED (con datos) o
    // NO_ACTIVE_INSCRIPCION (sin datos). Ambos se consideran éxito para
    // la búsqueda: un resultado vacío es válido (spec 046).
    if ( result.code === "INSCRIPCION_LISTED" || result.code === "NO_ACTIVE_INSCRIPCION" ) {
        return {
            error: false,
            message: "Búsqueda realizada",
            data: result.data ?? [],
            code: "BUSCAR_ALUMNO_OK",
        };
    }
    return {
        error: true,
        message: result.message || "Error en la búsqueda",
        code: result.code || "ERROR_SERVIDOR",
    };
};

/**
 * Lista las asistencias de la escuela del token en un rango de fechas
 * (spec 048).
 *
 * Flujo:
 * 1. Valida y normaliza los filtros con Zod (unico punto del backend donde se
 *    parsea el listado).
 * 2. Calcula el `offset` a partir de `pagina` y `limit`: **nunca** viene por la
 *    URL, asi no se puede desalinear con la pagina pedida.
 * 3. Delega en la capa data, que lee la **foto** guardada en la asistencia.
 * 4. Normaliza el caso vacio: `listarEntidad` devuelve `NO_ACTIVE_ASISTENCIAS`
 *    sin `paginacion` cuando no hay filas; aca se transforma en un 200 con
 *    `data: []` (la pantalla necesita listar un rango vacio, no un 404).
 *
 * @param {ListadoAsistenciasInputs} parametros - Filtros crudos del controlador
 *   (`id_escuela` sale del token, nunca de la query).
 * @returns {Promise<TipadoData<ListadoAsistenciaRow[]>>} Listado paginado.
 * @returns.code ASISTENCIAS_LISTADAS - Hay filas o el rango no tiene ninguna.
 * @returns.code ERROR_SERVIDOR - Falla inesperada de la base.
 */
const listadoAsistenciasServicio = async( parametros : ListadoAsistenciasInputs )
: Promise<TipadoData<ListadoAsistenciaRow[]>> => {
    const data : ListadoAsistenciasInputs = ListadoAsistenciasSchema.parse(parametros);
    const offset : number = (data.pagina - 1) * data.limit;

    const resultado = await asistenciaData.listadoAsistencias({ ...data, offset });

    if ( resultado.code === "NO_ACTIVE_ASISTENCIAS" ) {
        // Rango sin datos: es un exito para la pantalla (200 + lista vacia).
        return {
            error : false,
            message : "No hay asistencias en el rango pedido.",
            data : [],
            paginacion : {
                pagina : data.pagina,
                limite : data.limit,
                contadorPagina : 0,
                totalRegistros : 0
            },
            code : "ASISTENCIAS_LISTADAS"
        };
    };

    if ( resultado.code === "ASISTENCIAS_LISTED" ) {
        return {
            error : false,
            message : "Asistencias listadas.",
            data : resultado.data,
            paginacion : resultado.paginacion,
            code : "ASISTENCIAS_LISTADAS"
        };
    };

    return {
        error : true,
        message : resultado.message || "Error al listar las asistencias",
        code : "ERROR_SERVIDOR"
    };
};

export const method = {
    asistencia : tryCatchDatos( altaAsistencia ),
    asistenciaManual : tryCatchDatos( altaAsistenciaManual ),
    fechaAsistencia : tryCatchDatos( fechaAsistencia),
    dataAsistenciaServicio : tryCatchDatos( dataAsistenciaServicio ),
    infoAlumno : tryCatchDatos( infoAlumnoServicio ),
    buscarAlumno : tryCatchDatos( buscarAlumnoServicio ),
    listadoAsistencias : tryCatchDatos( listadoAsistenciasServicio ),
};
