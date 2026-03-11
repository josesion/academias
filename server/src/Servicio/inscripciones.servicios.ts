// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { tryCatchDatos } from "../utils/tryCatchBD";
// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────
import { method as inscripcionesData} from "../data/inscripciones.data";
// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import {  InscripcionInputs, InscripcionSchema ,
          FiltroHistorialInputs, FiltroHistorialSchema,  
 } from "../squemas/inscripciones";

import { DetalleCajaInputs, DetalleCajaSchema } from "../squemas/cajas";
import { InscripcionListado } from "../tipados/inscripciones";
import { TipadoData } from "../tipados/tipado.data";



/**
 * Servicio integral para la creación de inscripciones vinculadas a un movimiento de caja.
 * * Realiza la validación de esquemas (Zod), verifica si el alumno ya posee una inscripción vigente
 * y, en caso negativo, ejecuta la transacción de alta de inscripción junto con su pago.
 * * @async
 * @function inscripcionServiciosCaja
 * @param {InscripcionInputs} dataInscripcion - Datos principales de la inscripción (DNI, Plan, Escuela, etc.).
 * @param {Omit<DetalleCajaInputs, 'referencia_id'>} dataDetalle - Datos del pago para caja (Monto, Método de pago, etc.).
 * @returns {Promise<TipadoData<{ id_inscripcion : number, dni_alumno : number }>>} 
 * Objeto estandarizado con el resultado de la operación y los datos del alumno inscrito.
 * * @example
 * const resultado = await inscripcionServiciosCaja(datosAlumno, datosPago);
 * if (!resultado.error) {
 * console.log("Inscripción creada con ID:", resultado.data.id_inscripcion);
 * }
 */
const inscripcionServiciosCaja = async( 
    dataInscripcion: InscripcionInputs, 
    dataDetalle: Omit<DetalleCajaInputs, 'referencia_id'>)
: Promise<TipadoData<{ id_inscripcion : number , dni_alumno : number }>> =>{

    const validInsc = InscripcionSchema.parse(dataInscripcion);
  
    const validCaja = DetalleCajaSchema.omit({ referencia_id: true }).parse(dataDetalle);
    
    const inscVigente = await inscripcionesData.verificacion( validInsc );
   
    switch(inscVigente.code ){

        case "INSCRIPCION_NO_EXISTE" : {

            const resultadoInscripcion = await inscripcionesData.inscripcionConPagoAlta(validInsc, validCaja);
            //console.log(resultadoInscripcion)
            if ( resultadoInscripcion.code === "TRANSACCION_OK" ){
                return {
                    error : false,
                    message : `EL alumno : ${ dataInscripcion.dni_alumno }, registro existoso`,
                    data : resultadoInscripcion.data,
                    code : "INSCRIPCION_EXITOSA"
                };
            };

            if ( resultadoInscripcion.code === "TRANSACCION_FALLIDA" ){
                return {
                    error : true,
                    message : `La inscripcion fallo por alguna razon `,
                    data : resultadoInscripcion.data,
                    code : "INSCRIPCION_FALLIDA"
                };
            };           
           
            return {
                error: true,
                message: "No se pudo crear la inscripción",
                code: "INSCRIPCION_CREACION_FALLIDA"
            };
        }; 

        case "INSCRIPCION_EXISTE"    :{
                return {
                    error: true,
                    message: `El alumno : ${dataInscripcion.dni_alumno} ya se encuentra inscripto.`,
                    code: "INSCRIPCION_EXISTENTE"
                };
        };

        default:{
            return {
                error : true,
                message : "No se logro verificar la inscripcion",
                code   :"NO_SE_LOGRO_VERIFICAR"
            };
        };    

    };
};

/**
 * Orquestador para listar inscripciones. 
 * Realiza el cálculo de paginación, valida los inputs con Zod y gestiona las respuestas del repositorio.
 * * @async
 * @function listadoInscripciones
 * @param {FiltroHistorialInputs} data - Datos de entrada que incluyen filtros, límite y número de página.
 * @returns {Promise<TipadoData<InscripcionListado[]>>} Objeto de respuesta estandarizado (Data, Paginación, Errores).
 * * @example
 * const respuesta = await listadoInscripciones({
 * id_escuela: 107,
 * fecha_desde: '2026-01-01',
 * fecha_hasta: '2026-03-11',
 * estado: 'activos',
 * limit: 10,
 * pagina: 1
 * });
 */
const listadoInscripciones = async ( data : FiltroHistorialInputs )
: Promise<TipadoData<InscripcionListado[]>> =>{
    const { limit , estado , id_escuela, fecha_desde , fecha_hasta, pagina } = data ;

    const offset = ( pagina -1 ) * Number(limit) ;

    const dataSet = {
        limit ,
        estado,
        id_escuela,
        fecha_desde,
        fecha_hasta,
        offset, 
        pagina
    };

    const listadoData : FiltroHistorialInputs = FiltroHistorialSchema.parse( dataSet );

    const listaResultado = await inscripcionesData.listadoInscripciones( listadoData,  pagina)
    
    if ( listaResultado.code === "INSCRIPCIONES_LISTED" ){
       return{
            error : false,
            message : "Listado de inscripciones",
            data : listaResultado.data,
            paginacion : listaResultado.paginacion,
            code : "LISTADO_INSCRIPCION_OK"
       };     
    };
    if ( listaResultado.code === "NO_ACTIVE_INSCRIPCIONES" ){
       return{
            error : true,
            message : "Sin inscripciones",
            code  : "LISTADO_VACIO"
       }; 
    };
    return {
        error : true,
        message : "Error al buscar el listado de inscripcion",
        code  : "ERROR_LISTADO_INSCRIPCIONES"
    };    
};

export const method = {
    inscripcionServiciosCaja : tryCatchDatos( inscripcionServiciosCaja),
    listadoInscripciones     : tryCatchDatos( listadoInscripciones ),
};