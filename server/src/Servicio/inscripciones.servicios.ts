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
import { registroHistorial } from "../utils/postHistorial";
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
import { type HistorialInputs } from "../squemas/historial";


/**
 * Servicio centralizado para gestionar el registro de inscripciones en el sistema.
 * 
 * Divide su lógica de ejecución según el plan SaaS del usuario autenticado:
 * - **Básico**: Ejecuta un registro de inscripción simplificado y directo a la base de datos sin interactuar con el módulo de caja, generando su respectivo registro de historial.
 * - **Intermedio**: Ejecuta un flujo transaccional completo que valida la existencia previa del alumno, gestiona el detalle de caja, impacta las cuentas financieras y registra el historial con todos los datos correspondientes.
 * 
 * @async
 * @function inscripcionServiciosCaja
 * @param {InscripcionInputs} dataInscripcion - Datos de entrada de la inscripción validados por esquema (incluye plan, escuela, alumno, fechas, montos y tipo de plan).
 * @param {Omit<DetalleCajaInputs, 'referencia_id'>} dataDetalle - Datos complementarios para el movimiento de caja (requerido y utilizado exclusivamente para el plan intermedio).
 * @returns {Promise<TipadoData<{ id?: number; dni_alumno: number }>>} Resultado estructurado de la operación con estado de error, mensaje descriptivo, datos de retorno y código de estado del servidor.
 */
const inscripcionServiciosCaja = async( 
    dataInscripcion: InscripcionInputs, 
    dataDetalle: Omit<DetalleCajaInputs, 'referencia_id'>
): Promise<TipadoData<{ id? : number , dni_alumno : number }>> =>{

    const validInsc = InscripcionSchema.parse(dataInscripcion);
   
    // 1. Verificamos vigencia / existencia del alumno primero para ambos planes
    const inscVigente = await inscripcionesData.verificacion( validInsc );
   
    switch( inscVigente.code ){

        case "INSCRIPCION_EXISTE": {
            return {
                error: true,
                message: `El alumno : ${validInsc.dni_alumno} ya se encuentra inscripto.`,
                code: "INSCRIPCION_EXISTENTE"
            };
        }

        case "INSCRIPCION_NO_EXISTE": {

            // 2. Si no existe, bifurcamos según el tipo de plan SaaS
            
            if( validInsc.tipo === "basico") {
              
                const resultInscripcionBasica = await inscripcionesData.inscripcionBasica( validInsc );
                             
                if ( resultInscripcionBasica.code === "INSCRIPCIONES_CREAR" || !resultInscripcionBasica.error ){

                    const dataHistorial : HistorialInputs = {
                        id_escuela : validInsc.id_escuela,
                        id_usuario : validInsc.id_usuario,
                        modulo : "INSCRIPCIONES",
                        accion : "CREAR",
                        id_registro: Number(resultInscripcionBasica.data?.id),
                        descripcion: `Inscripción básica del alumno, DNI: ${validInsc.dni_alumno}`,
                        datos: {
                            id_inscripcion : resultInscripcionBasica.data?.id,
                            alumno : validInsc.dni_alumno
                        }
                    }; 
                    
                    await registroHistorial(dataHistorial);

                    return {
                        error : false, 
                        message : `El alumno: ${validInsc.dni_alumno}, registro exitoso`,
                        data : { dni_alumno : validInsc.dni_alumno },
                        code : "INSCRIPCION_EXITOSA"
                    };
                }

                return {
                    error: true,
                    message: "No se pudo crear la inscripción básica",
                    code: "INSCRIPCION_CREACION_FALLIDA"
                };
            };

            if( validInsc.tipo === "intermedio") {
               
                const validCaja = DetalleCajaSchema.omit({ referencia_id: true }).parse(dataDetalle);
                
                const resultadoInscripcion = await inscripcionesData.inscripcionConPagoAlta(validInsc, validCaja);
        
                if ( resultadoInscripcion.code === "TRANSACCION_OK" ){

                    const dataHistorial : HistorialInputs = {
                        id_escuela : validInsc.id_escuela,
                        id_usuario : validInsc.id_usuario,
                        modulo : "INSCRIPCIONES",
                        accion : "CREAR",
                        id_registro: Number(resultadoInscripcion.data?.id_inscripcion),
                        descripcion: `Inscripcion del alumno, DNI: ${resultadoInscripcion.data?.dni_alumno}`,
                        datos: {
                            id_inscripcion : resultadoInscripcion.data?.id_inscripcion,
                            alumno : resultadoInscripcion.data?.dni_alumno
                        }
                    }; 
                    
                    await registroHistorial( dataHistorial);         

                    return {
                        error : false,
                        message : `EL alumno : ${ dataInscripcion.dni_alumno }, registro exitoso`,
                        data : resultadoInscripcion.data,
                        code : "INSCRIPCION_EXITOSA"
                    };
                };

                if ( resultadoInscripcion.code === "TRANSACCION_FALLIDA" ){
                    return {
                        error : true,
                        message : `La inscripción falló por alguna razón`,
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

            break;
        }

        default: {
            return {
                error : true,
                message : "No se logró verificar la inscripción",
                code : "NO_SE_LOGRO_VERIFICAR"
            };
        }

    };   
   
    return{
        error : true, 
        message : "Error en el servidor , Inscripción.",
        code : "ERROR_SERVIDOR"
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

    const listaResultado = await inscripcionesData.listadoInscripciones( listadoData,  pagina);
  
  
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
 * Servicio para anular una inscripción en el sistema.
 * 
 * Gestiona dos flujos según el plan SaaS del usuario:
 * - **Intermedio**: Valida caja abierta, categoría de anulación, asistencias previas, saldo disponible en caja, impacta la caja financiera y registra el historial con montos.
 * - **Básico**: Realiza la anulación de forma directa sin interactuar con el módulo de caja ni saldos, registrando un historial simplificado.
 * 
 * @async
 * @function anularInscripcionServicio
 * @param {AnularInscripcionInputs} dataInsc - Datos de entrada validados por esquema (IDs operativos y tipo de plan SaaS).
 * @param {Omit<DetalleCajaInputs, 'referencia_id'>} dataDetalle - Datos del detalle de caja para la transacción financiera (requerido para plan intermedio).
 * @returns {Promise<TipadoData<{ id_inscripcion: number }>>} Resultado de la operación con estado de error, mensaje descriptivo, datos y código de estado del servidor.
 */
const anularInscripcionServicio = async (
    dataInsc: AnularInscripcionInputs,
    dataDetalle: Omit<DetalleCajaInputs, 'referencia_id'>
): Promise<TipadoData<{ id_inscripcion: number }>> => {

    // 1. Validamos datos de entrada
    const verificacionInsc : AnularInscripcionInputs = AnularInscripcionSchema.parse(dataInsc);
    const id_escuela = verificacionInsc.id_escuela || 1;
  
    if( verificacionInsc.tipo === "intermedio" ){

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
            };

            // 10. Todo salió espectacular
            const mensajeExito = `Se anuló correctamente, pero se devolvió $${montoOriginal}`
                        
            

                    const dataHistorial  : HistorialInputs = {
                        id_escuela :  verificacionInsc.id_escuela ,
                        id_usuario :  verificacionInsc.id_usuario,
                        modulo : "INSCRIPCIONES",
                        accion : "ANULACION",
                        id_registro: Number(verificacionInsc.id_inscripcion),
                        descripcion: `Inscripcion anulada Numero :${verificacionInsc.id_inscripcion} con el monto ${montoOriginal}`,
                        datos: {
                            id_inscripcion : verificacionInsc.id_inscripcion,
                            monto : montoOriginal
                        }
                    }; 
                    
                    await registroHistorial( dataHistorial);

            return {
                error: false,
                message: mensajeExito,
                data: anularInscripcion.data,
                code: "TRANSACCION_EXITOSA_ANULACION_INSCRIPCION"
            };

    };    

    if( verificacionInsc.tipo === "basico" ){
        
        const resultAnulacionBasica = await inscripcionesData.anularInscripcionBasico( verificacionInsc );
              
        if( resultAnulacionBasica.code === "ANULAR_INSCRIPCION_MODIFICAR"  ){
                
                const dataHistorial : HistorialInputs = {
                    id_escuela :  verificacionInsc.id_escuela ,
                    id_usuario :  verificacionInsc.id_usuario,
                    modulo : "INSCRIPCIONES",
                    accion : "ANULACION",
                    id_registro: Number(verificacionInsc.id_inscripcion),
                    descripcion: `Inscripcion anulada Numero : ${verificacionInsc.id_inscripcion}`,
                    datos: {
                        id_inscripcion : verificacionInsc.id_inscripcion
                    }
                }; 
                
                await registroHistorial( dataHistorial);

            return {
                error : false,
                message : "Anulacion correcta del plan",
                data :  { id_inscripcion : verificacionInsc.id_inscripcion },
                code  :  "TRANSACCION_EXITOSA_ANULACION_INSCRIPCION"
            };
        };
    };

    return{
        error : true, 
        message : "Error en el servidor , Anulacion de inscripcion.",
        code : "ERROR_SERVIDOR"
    };    

};

export const method = {
    inscripcionServiciosCaja : tryCatchDatos( inscripcionServiciosCaja),
    listadoInscripciones     : tryCatchDatos( listadoInscripciones ),
    anularInscripcionServicio : tryCatchDatos( anularInscripcionServicio ),
};