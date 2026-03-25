// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────

import { tryCatchDatos } from "../utils/tryCatchBD";
// ──────────────────────────────────────────────────────────────
// Capa de acceso a datos para ejecutar la lógica de planes contra la base de datos.
// ──────────────────────────────────────────────────────────────
import { method as inscripcionesData} from "../data/inscripciones.data";
import { method as categoriasCajaData } from "../data/categoria.cajas.data";
import { method as dataCaja } from "../data/caja.data";
// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import {  InscripcionInputs, InscripcionSchema ,
          FiltroHistorialInputs, FiltroHistorialSchema,
          AnularInscripcionInputs, AnularInscripcionSchema,  
 } from "../squemas/inscripciones";

import { DetalleCajaInputs, DetalleCajaSchema } from "../squemas/cajas";
import { InscripcionListado } from "../tipados/inscripciones";
import { TipadoData } from "../tipados/tipado.data";



/**
 * Servicio de alto nivel para gestionar el proceso de inscripción con pago.
 * * Este servicio actúa como orquestador realizando las siguientes acciones:
 * 1. Valida los esquemas de entrada (Inscripción y Caja) usando Zod.
 * 2. Verifica si el alumno ya posee una inscripción vigente para evitar duplicados.
 * 3. Si no existe, procede a ejecutar la transacción de alta académica y financiera.
 * * @param {InscripcionInputs} dataInscripcion - Información académica del alumno y el plan.
 * @param {Omit<DetalleCajaInputs, 'referencia_id'>} dataDetalle - Información del pago para la caja.
 * * @returns {Promise<TipadoData<{ id_inscripcion: number, dni_alumno: number }>>} 
 * Promesa con el resultado de la operación:
 * - `INSCRIPCION_EXITOSA`: El proceso completo terminó correctamente.
 * - `INSCRIPCION_EXISTENTE`: Se detuvo el proceso porque el alumno ya está inscripto.
 * - `INSCRIPCION_FALLIDA`: Error controlado durante la transacción.
 * - `NO_SE_LOGRO_VERIFICAR`: Error inesperado en la etapa de comprobación.
 * * @example
 * const respuesta = await inscripcionServiciosCaja(datosFormulario, datosPago);
 * if (respuesta.code === "INSCRIPCION_EXITOSA") {
 * console.log("Alumno registrado y pago ingresado a caja.");
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
    const { limit , estado , id_escuela, fecha_desde , fecha_hasta, pagina, nombre_alumno, dni_alumno } = data ;

    const offset = ( pagina -1 ) * Number(limit) ;

    const dataSet = {
        limit ,
        estado,
        id_escuela,
        fecha_desde,
        fecha_hasta,
        offset, 
        nombre_alumno,
        dni_alumno,
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

/**
 * Servicio de anulación con lógica de protección financiera.
 * * @description Orquesta la anulación validando que:
 * 1. Exista caja abierta.
 * 2. Exista categoría de anulación.
 * 3. La inscripción no tenga asistencias y esté activa.
 * 4. El monto a devolver no exceda el monto original de la inscripción (Autocorrección).
 * * @returns {Promise<TipadoData<{id_inscripcion: number}>>}
 */
const anularInscripcionServicio = async (
    dataInsc   : AnularInscripcionInputs,
    dataDetalle: Omit<DetalleCajaInputs, 'referencia_id'>
) : Promise<TipadoData<{id_inscripcion : number}>> =>{

    const verificacionInsc : AnularInscripcionInputs = AnularInscripcionSchema.parse( dataInsc );
    const id_escuela = verificacionInsc.id_escuela || 1 ;

    const cajaAbierta = await dataCaja.idCajaAbierta({ id_escuela });
  
    if ( cajaAbierta.code === "ID_CAJA_EXISTE" ){
        const idCajaAnulacion  = await categoriasCajaData.localizarAnulacionCategortia({ id_escuela });

        if ( idCajaAnulacion.code === "ID_ANULACION_CATCAJA_EXISTE" ){
        const validarConsumo = await inscripcionesData.reglaAnulacionInscripcion(verificacionInsc);
           
            if (validarConsumo.data?.tiene_asistencias  === 1 || validarConsumo.data?.esta_activa === 0 ){
                // si tiene asitencia se niega la anulaciion
                return{
                        error : true,
                        message: validarConsumo.data?.esta_activa === 0 
                                ? "La inscripción ya no está activa" 
                                : "No se puede anular: El alumno ya tiene asistencias",
                        code : "SIN_PERMISO"
                };     
            };
            // si NO tiene se puede anular la inscripcion 
            if (validarConsumo.data?.tiene_asistencias === 0 ){
            //
                const montoOriginal = validarConsumo.data.monto_inscripcion;
                const montoPeticion = dataDetalle.monto;
               
                
                // Elegimos el monto real a devolver: el de la petición, 
                // a menos que sea mayor al original (en cuyo caso usamos el original).
                const montoFinal = montoPeticion > montoOriginal ? montoOriginal : montoPeticion;

                const dataDetalleParametros  = {
                    id_caja : cajaAbierta.data?.id_caja,
                    id_categoria : idCajaAnulacion.data?.id_categoria,
                    monto : montoFinal ,
                    metodo_pago : dataDetalle.metodo_pago,
                    descripcion : dataDetalle.descripcion 
                };

                const validarCaja = DetalleCajaSchema.omit({ referencia_id: true }).parse(dataDetalleParametros); 

                const anularInscripcion = await inscripcionesData.anularInscripcion( verificacionInsc, validarCaja);

                if ( anularInscripcion.code === "TRANSACCION_OK"){

                    const mensajeExito = montoPeticion > montoOriginal 
                        ? `Se anuló correctamente, pero se devolvió $${montoOriginal} (monto máximo abonado).`
                        : "Se anuló correctamente la inscripción";
                    return{
                        error : false,
                        message : mensajeExito,
                        data : anularInscripcion.data,
                        code : "TRANSACCION_EXITOSA_ANULACION_INSCRIPCION"
                    };
                }
                if (  anularInscripcion.code === "TRANSACCION_FALLIDA"){
                    return{
                        error : true,
                        message : "Error en la trnsaccion, intentar mas tarde",
                        code  : "TRANSACCION_FALLIDA_ANULAR_INCRIPCION"
                    };
                };        
            };

        };
        if ( idCajaAnulacion.code === "ID_ANULACION_CATCAJA_NO_EXISTE" ){
            return {
                error : true,
                message : "Error, categoria anulacion no existe",
                code : "SIN_CATEGORIA_ANULACION"
            };
        };

    };

    if ( cajaAbierta.code === "ID_CAJA_NO_EXISTE" ){
        return {
            error : true,
            message : "No hay caja abierta, abrir para seguir",
            code : "NO_EXISTE_CAJA"
        };
    };       

   return{
        error : true,
        message : "Error, paso un error en la anulacion de la inscripcion",
        code : "ERROR_SERVIDOR_ANULACION_INSCRIPCION"
   }; 
};


export const method = {
    inscripcionServiciosCaja : tryCatchDatos( inscripcionServiciosCaja),
    listadoInscripciones     : tryCatchDatos( listadoInscripciones ),
    anularInscripcionServicio : tryCatchDatos( anularInscripcionServicio ),
};