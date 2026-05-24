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
 * Servicio centralizado para gestionar la anulación de una inscripción en DanzaStudio Pro.
 * * Realiza un flujo estricto de validaciones contables y de negocio antes de impactar
 * la base de datos mediante una transacción segura.
 * * @async
 * @function anularInscripcionServicio
 * @param {AnularInscripcionInputs} dataInsc - Datos de entrada validados para identificar la inscripción a anular.
 * @param {Omit<DetalleCajaInputs, 'referencia_id'>} dataDetalle - Información complementaria para el movimiento de caja (como la descripción).
 * * @returns {Promise<TipadoData<{ id_inscripcion: number }>>} Estructura estándar con el resultado de la operación.
 * * @throws {ZodError} Si los datos de entrada o el objeto final de caja no cumplen con los esquemas de validación.
 * * @description
 * El servicio ejecuta secuencialmente el siguiente flujo blindado:
 * 1.  **Validación de Entrada:** Valida los tipos con `AnularInscripcionSchema`.
 * 2.  **Control de Caja:** Verifica la existencia de una caja abierta activa para la escuela (`Guard Clause`).
 * 3.  **Control de Categoría:** Localiza el identificador del movimiento configurado para anulaciones (`Guard Clause`).
 * 4.  **Reglas de Negocio (Alumno):** Bloquea la operación si el alumno ya registra asistencias vigentes o si la inscripción está inactiva.
 * 5.  **Resolución de Cuenta:** Determina el método de pago final (priorizando la entrada manual o heredando el original de la BD).
 * 6.  **Control de Liquidez (Patovica Contable):** Consulta el saldo neto actual de la cuenta en esa caja específica. Si el dinero disponible es menor al monto original de la inscripción, frena el flujo para evitar saldos negativos.
 * 7.  **Persistencia Transaccional:** Ejecuta en bloque la anulación de la inscripción y la salida de dinero en la tabla de detalles de caja.
 */
const anularInscripcionServicio = async (
    dataInsc: AnularInscripcionInputs,
    dataDetalle: Omit<DetalleCajaInputs, 'referencia_id'>
): Promise<TipadoData<{ id_inscripcion: number }>> => {

    // 1. Validamos datos de entrada
    const verificacionInsc = AnularInscripcionSchema.parse(dataInsc);
    const id_escuela = verificacionInsc.id_escuela || 1;

    // 2. Controlar Caja Abierta (Guard Clause)
    const cajaAbierta = await dataCaja.idCajaAbierta({ id_escuela });

    if (cajaAbierta.code === "ID_CAJA_NO_EXISTE" || !cajaAbierta.data) {
        return {
            error: true,
            message: "No hay caja abierta, abrir para seguir",
            code: "NO_EXISTE_CAJA"
        };
    }

    // 3. Controlar Categoría de Anulación (Guard Clause)
    const idCajaAnulacion = await categoriasCajaData.localizarAnulacionCategortia({ id_escuela });

    if (idCajaAnulacion.code === "ID_ANULACION_CATCAJA_NO_EXISTE" || !idCajaAnulacion.data) {
        return {
            error: true,
            message: "Error, categoría anulación no existe",
            code: "SIN_CATEGORIA_ANULACION"
        };
    }
    
    // 4. Validar Reglas del Alumno (Asistencias / Vencimiento)
    const validarConsumo = await inscripcionesData.reglaAnulacionInscripcion(verificacionInsc);
   
  
        // Si la respuesta dio error o mágicamente no trajo la data, cortamos acá
        if (!validarConsumo.data) {
            return {
                error: true,
                message: validarConsumo.message || "No se encontraron los datos de la inscripción",
                code: "ERROR_VALIDACION_INSCRIPCION"
            };
        }

        // CONTROL DE ASISTENCIAS Y ACTIVIDAD
        // Como ya validamos arriba que 'validarConsumo.data' EXISTE, acá usamos el signo de pregunta por las dudas
        // pero TypeScript ya sabe que no va a ser undefined.
        if (validarConsumo.data.tiene_asistencias >= 1 || validarConsumo.data.esta_activa === 0) {
            return {
                error: true,
                message: validarConsumo.data.esta_activa === 0 
                    ? "La inscripción ya no está activa" 
                    : "No se puede anular: El alumno ya tiene asistencias",
                code: "SIN_PERMISO"
            };
        }

    // 5. Resolver Cuenta (Método de Pago) de forma inteligente
    const id_metodo_pago_bd = await inscripcionesData.idMetodoPago(verificacionInsc.id_inscripcion);


    const id_cuenta_final = verificacionInsc.id_cuenta || id_metodo_pago_bd.data?.id_cuenta;

    if (!id_cuenta_final) {
        return {
            error: true,
            message: "Error crítico, no se detectó método de pago para anular",
            code: "ERROR_SIN_METODO_PAGO"
        };
    };

    // 6. Cálculos de montos para la devolución

    const montoOriginal = Number(validarConsumo.data?.monto_inscripcion);
    
    // 7. Verificamos si existe el monto suficiente  para la anulacion y la devolucion 
    const verificarSaldo = await inscripcionesData.saldoMetodoPago( cajaAbierta.data.id_caja, id_cuenta_final );

    if ( verificarSaldo.code === "SALDO_NO_EXISTE"|| Number(verificarSaldo.data?.saldo_actual ?? 0) <  montoOriginal){
        return {
                error: true,
                message: `No se puede anular: Saldo insuficiente o inexistente. Requerido: $${montoOriginal}`,
                code: "SALDO_INSUFICIENTE_CAJA"
            };        
    };

     //8. Armamos el objeto estructurado para el detalle de caja
   
     const dataDetalleParametros = {
         id_escuela: verificacionInsc.id_escuela,
         id_caja: cajaAbierta.data.id_caja,
         id_categoria: idCajaAnulacion.data.id_categoria,
         id_cuenta: id_cuenta_final,
         id_usuario: verificacionInsc.id_usuario , // ¡Acá pescamos el id de usuario del token!
         monto: montoOriginal,
         descripcion: dataDetalle.descripcion
     };

  
     const validarCaja = DetalleCajaSchema.omit({ referencia_id: true }).parse(dataDetalleParametros);
 
     // 9. Impactamos la Base de Datos con la transacción
     const anularInscripcion = await inscripcionesData.anularInscripcion(verificacionInsc, validarCaja);

     if (anularInscripcion.code === "TRANSACCION_FALLIDA") {
         return {
             error: true,
             message: "Error en la transacción, intentar más tarde",
             code: "TRANSACCION_FALLIDA_ANULAR_INCRIPCION"
         };
     }

     // 10. Todo salió espectacular
     const mensajeExito = `Se anuló correctamente, pero se devolvió $${montoOriginal}`



     return {
         error: false,
         message: mensajeExito,
         data: anularInscripcion.data,
         code: "TRANSACCION_EXITOSA_ANULACION_INSCRIPCION"
     };
};

export const method = {
    inscripcionServiciosCaja : tryCatchDatos( inscripcionServiciosCaja),
    listadoInscripciones     : tryCatchDatos( listadoInscripciones ),
    anularInscripcionServicio : tryCatchDatos( anularInscripcionServicio ),
};