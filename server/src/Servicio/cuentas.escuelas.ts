import { method as  cuentasData} from "../data/cuentas.escuelas";
import { registroHistorial } from "../utils/postHistorial";
// hooks seccion -------------------------------------
import { tryCatchDatos } from "../utils/tryCatchBD";


// Tipados seccion -----------------------------------
import { CuentaEscuelaInput, CuentaEscuelaSchema,
         ModificarCuentaEscuelaUnputs, ModificarCuentaEscuelaSchema,
         EstadoCuentasInputs, EstadoCuentasSchema,
         ListadoCuentasInputs, ListadoCuentasSchema,
 } from "../squemas/cuentas.escuelas"; 
import { type HistorialInputs } from "../squemas/historial"; 
import { TipadoData } from "../tipados/tipado.data";


/**
 * Servicio encargado de gestionar la creación de una nueva cuenta para la escuela,
 * preparando los datos iniciales, validándolos con Zod, comprobando que no exista duplicidad de nombre,
 * ejecutando el registro en la base de datos, guardando la acción en el historial de auditoría
 * y retornando la respuesta correspondiente.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Estructura y completa los datos de la cuenta (asignando un estado por defecto si no se provee).
 * 2. Valida los datos mediante el esquema `CuentaEscuelaSchema`.
 * 3. Verifica si ya existe una cuenta con el mismo nombre en la escuela (`cuentasData.verificarCuentaEscuela`).
 * 4. Si la cuenta no existe (`CUENTAS_NO_EXISTE`), procede a crearla en la base de datos (`cuentasData.crearCuentaEscuela`).
 * 5. Si la creación es exitosa (`CUENTAS_CREAR`), construye y registra el evento de auditoría mediante `registroHistorial` en el módulo "CATEGORIAS_CAJA".
 * 6. Retorna la respuesta de éxito o los distintos códigos de error según los resultados y validaciones obtenidas.
 *
 * @async
 * @function crearCuentaEscuelaServicio
 * @param {Object} dataCuenta - Objeto con los datos iniciales de la cuenta 
 * (incluyendo ID de escuela, nombre, tipo, estado opcional e ID de usuario).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el estado de la operación de creación,
 * incluyendo mensajes descriptivos, los datos de la cuenta creada y códigos internos de éxito o error.
 * 
 * @throws {Error} Si la estructura de los datos de entrada no cumple con `CuentaEscuelaSchema`.
 * 
 * @example
 * const resultado = await crearCuentaEscuelaServicio({
 *    id_escuela: 1,
 *    nombre_cuenta: "Caja Chica",
 *    tipo_cuenta: "Efectivo",
 *    estado: "activos",
 *    id_usuario: 5
 * });
 */
const crearCuentaEscuelaServicio = async ( dataCuenta : CuentaEscuelaInput)
: Promise<TipadoData<{ nombre_cuenta : string , tipo_cuenta : string }>> => {
 
  const data : CuentaEscuelaInput  ={
    id_escuela : dataCuenta.id_escuela,
    nombre_cuenta : dataCuenta.nombre_cuenta,
    tipo_cuenta : dataCuenta.tipo_cuenta,
    estado : dataCuenta.estado || "activos",
    id_usuario : dataCuenta.id_usuario
  };  

  const validarDatos : CuentaEscuelaInput = CuentaEscuelaSchema.parse(data);

  const filtroDuplicado = await  cuentasData.verificarCuentaEscuela(
         validarDatos.nombre_cuenta,
         validarDatos.id_escuela
  );


  if ( filtroDuplicado.code ===  "CUENTAS_NO_EXISTE" ){
   
     const registroCuenta = await cuentasData.crearCuentaEscuela(validarDatos);

     if ( registroCuenta.code === "CUENTAS_CREAR"){

        const dataHistorial  : HistorialInputs = {
            id_escuela :  validarDatos.id_escuela ,
            id_usuario :  validarDatos.id_usuario,
            modulo : "CATEGORIAS_CAJA",
            accion : "CREAR",
            id_registro: Number(registroCuenta.data?.id),
            descripcion: `Registro Categoria caja : ${validarDatos.nombre_cuenta}`,
            datos: {
                id_categoria : registroCuenta.data?.id,
                nombre_categoria : registroCuenta.data?.nombre_cuenta,
                tipo : registroCuenta.data?.tipo_cuenta
            } // datos del alumno
        }; 
            
        await registroHistorial( dataHistorial);   

        return {
            error : false,
            message : "Cuenta creada exitosamente",
            data : registroCuenta.data,
            code : "CUENTAS_CREADA_EXITOSAMENTE"
        };
     }
    return {
        error: true,
        message: registroCuenta.message || "No se pudo registrar la cuenta en la base de datos",
        code: "CUENTAS_ERROR_CREACION"
    };     
  };

  if ( filtroDuplicado.code ===  "CUENTAS_EXISTE" ){
     return {
        error : true ,
        message : `Ya existe una cuenta ${validarDatos.nombre_cuenta} para esta escuela`,
        code : "CUENTAS_EXISTE"
     };
  };


  return{
    error : true,
    message : "Error en el servidor al crear la cuenta, por favor intente nuevamente",
    code : "ERROR_SERVIDOR"
  };
  
};

/**
 * Servicio encargado de gestionar la modificación de una cuenta de la escuela,
 * validando los datos con Zod, comprobando que no exista otra cuenta con el mismo nombre,
 * ejecutando la actualización en la base de datos, registrando la acción en el historial de auditoría
 * y retornando el resultado correspondiente.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `ModificarCuentaEscuelaSchema`.
 * 2. Verifica si ya existe una cuenta con el nuevo nombre en la escuela (`cuentasData.verificarCuentaEscuela`).
 * 3. Si la cuenta ya existe (`CUENTAS_EXISTE`), retorna un error indicando la duplicidad.
 * 4. Si no existe (`CUENTAS_NO_EXISTE`), procede a modificar la cuenta en la capa de datos (`cuentasData.modCuentaEscuela`).
 * 5. Si la modificación es exitosa (`CUENTAS_MODIFICAR`), construye y registra el evento de auditoría mediante `registroHistorial` en el módulo "CATEGORIAS_CAJA".
 * 6. Retorna la respuesta de éxito o los distintos códigos de error según los resultados obtenidos.
 *
 * @async
 * @function modCuentaEscuelaServicio
 * @param {Object} dataMod - Objeto con los datos necesarios para modificar la cuenta 
 * (incluyendo ID de cuenta, nuevo nombre, nuevo tipo, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el estado de la operación de modificación,
 * incluyendo mensajes descriptivos, los datos actualizados de la cuenta y códigos internos de éxito o error.
 * 
 * @throws {Error} Si la estructura de los datos de entrada no cumple con `ModificarCuentaEscuelaSchema`.
 * 
 * @example
 * const resultado = await modCuentaEscuelaServicio({
 *    id_cuenta: 2,
 *    nuevo_nombre_cuenta: "Caja Principal",
 *    nuevo_tipo_cuenta: "Efectivo",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
 */
const modCuentaEscuelaServicio = async ( dataMod : ModificarCuentaEscuelaUnputs)
: Promise<TipadoData<{id_cuenta: number, nuevo_nombre_cuenta : string, nuevo_tipo_cuenta : string}>> =>{
   // console.log("Servicio entrada", dataMod);
    const validarDatos : ModificarCuentaEscuelaUnputs= ModificarCuentaEscuelaSchema.parse(dataMod);
   // console.log("Filtrado y validado", validarDatos);
    const verificarCuentaExistente = await cuentasData.verificarCuentaEscuela(
        validarDatos.nuevo_nombre_cuenta,
        validarDatos.id_escuela
    );
    //console.log("verificacion de cuenta existente", verificarCuentaExistente)

    if ( verificarCuentaExistente.code === "CUENTAS_EXISTE"){
        return {
            error : true,
            message : `La cuenta : ${validarDatos.nuevo_nombre_cuenta} ya existe para esta escuela`,
            code : "CUENTAS_EXISTE"
        };
    };

    if ( verificarCuentaExistente.code === "CUENTAS_NO_EXISTE"){

        const modificarCuenta = await cuentasData.modCuentaEscuela(validarDatos);

        if ( modificarCuenta.code === "CUENTAS_MODIFICAR"){

            const dataHistorial  : HistorialInputs = {
                id_escuela :  validarDatos.id_escuela ,
                id_usuario :  validarDatos.id_usuario,
                modulo : "CATEGORIAS_CAJA",
                accion : "MODIFICAR",
                id_registro: Number(validarDatos.id_cuenta),
                descripcion: `Se modifico Categoria caja : ${validarDatos.nuevo_nombre_cuenta}`,
                datos: {
                    id_categoria : modificarCuenta.data?.id_cuenta,
                    nombre_categoria : modificarCuenta.data?.nuevo_nombre_cuenta,
                    tipo : modificarCuenta.data?.nuevo_tipo_cuenta
                } // datos del alumno
            }; 
            
            await registroHistorial( dataHistorial);   


            return {
                error : false , 
                message : "Cuenta modificada exitosamente",
                data : modificarCuenta.data,
                code : "CUENTAS_MODIFCADA_EXITOSAMENTE"
            };
        };

        return {
            error : true,
            message : "No se pudo modificar la cuenta en la base de datos",
            code : "CUENTAS_ERROR_MODIFICACION"
        };
    };    

    return {
        error : true,
        message : "Error en el servidor al modificar la cuenta, por favor intente nuevamente",
        code : "ERROR_SERVIDOR"
    };
};

/**
 * Servicio encargado de gestionar el cambio de estado (activar/inactivar) de una cuenta de la escuela,
 * validando los datos con Zod, ejecutando la modificación en la base de datos, registrando
 * la acción correspondiente en el historial de auditoría y retornando el resultado estructurado.
 * 
 * Este proceso realiza los siguientes pasos:
 * 1. Valida los datos de entrada mediante el esquema `EstadoCuentasSchema`.
 * 2. Ejecuta la modificación del estado en la capa de datos (`cuentasData.estadoCuenta`).
 * 3. Si la operación es exitosa (`CUENTAS_MODIFICAR`), determina el estado final y la acción ("RESTAURAR" o "ELIMINAR").
 * 4. Construye y registra el evento de auditoría mediante `registroHistorial` en el módulo "CATEGORIAS_CAJA".
 * 5. Retorna la respuesta de éxito o los distintos códigos de error según corresponda.
 *
 * @async
 * @function estadoCuentasEscuela
 * @param {Object} dataEstado - Objeto con los datos necesarios para modificar el estado de la cuenta 
 * (incluyendo ID de cuenta, estado, ID de escuela e ID de usuario).
 * 
 * @returns {Promise<Object>} Promesa que resuelve con el estado de la operación,
 * incluyendo mensajes descriptivos, datos de la cuenta modificada y códigos internos de éxito o error.
 * 
 * @throws {Error} Si la estructura de los datos de entrada no cumple con `EstadoCuentasSchema`.
 * 
 * @example
 * const resultado = await estadoCuentasEscuela({
 *    id_cuenta: 3,
 *    estado: "activos",
 *    id_escuela: 1,
 *    id_usuario: 5
 * });
 */
const estadoCuentasEscuela = async ( dataEstado : EstadoCuentasInputs)
: Promise<TipadoData<{ id_cuenta : number , estado : string}>>  =>{
   const validarDatos : EstadoCuentasInputs = EstadoCuentasSchema.parse( dataEstado);
  // console.log( "datos validados", validarDatos)
   const modEstadoCuenta = await cuentasData.estadoCuenta( validarDatos);

   if ( modEstadoCuenta.code === "CUENTAS_MODIFICAR"){
        const estadoFinal  = validarDatos.estado === "activos" ? "activo" : "inactivo";
        const accionFinal  = validarDatos.estado === "activos" ? "RESTAURAR" : "ELIMINAR"
        const dataHistorial  : HistorialInputs = {
            id_escuela :  validarDatos.id_escuela ,
            id_usuario :  validarDatos.id_usuario,
            modulo : "CATEGORIAS_CAJA",
            accion :  accionFinal,
            id_registro: Number(validarDatos.id_cuenta),
            descripcion:  `Estado de : ${validarDatos.id_cuenta} cambio a  ${estadoFinal}`,
            datos: {
                id_categoria :  validarDatos.id_cuenta,
                estado :  estadoFinal
            } 
        }; 
            
       await registroHistorial( dataHistorial);  

      return {
            error : false , 
            message : "Estado de cuenta modificado exitosamente",
            data : modEstadoCuenta.data,
            code : "CUENTAS_MODIFICADA_EXITOSAMENTE"
      };
   };

   if ( modEstadoCuenta.code === "MODIFICAR_NOT_FOUND"){
      return{
           error : true,
           message : "No se pudo cambie el estado de la cuenta, por favor intente nuevamente",
           code : "ERROR_CUENTAS_SERVIDOR"
      };
   };
   return {
        error : true,
        message : "Error en el servidor al cambiar estado de cuenta, por favor intente nuevamente",
        code : "ERROR_SERVIDOR"
    };   
};

/**
 * Servicio para obtener el listado de cuentas con validación de esquema y lógica de negocio.
 * * @async
 * @function listadoCuentas
 * @param {ListadoCuentasInputs} params - Parámetros de entrada (filtros, página y límite).
 * * @returns {Promise<{
 * error: boolean,
 * message: string,
 * data?: any[],
 * paginacion?: any,
 * code: string
 * }>} Objeto de respuesta estandarizado para el controlador.
 * * @description
 * 1. Calcula el `offset` basado en la página y el límite recibidos.
 * 2. Valida la integridad de todos los datos mediante `ListadoCuentasSchema`.
 * 3. Llama a la capa de datos para ejecutar la consulta SQL.
 * 4. Mapea los códigos de respuesta de la base de datos a códigos de respuesta de servicio.
 */
const listadoCuentas = async ( params : ListadoCuentasInputs) =>{
  
    
    const validarData : ListadoCuentasInputs = ListadoCuentasSchema.parse(params);
   
    const listadoCuentas = await cuentasData.listdoCuentasDatos(validarData);



   if ( listadoCuentas.code === 'TIPO_CUENTAS_LISTED' ){
        return {
            error : false, 
            message : "Listado de tipos cuentas",
            data : listadoCuentas.data,
            paginacion : listadoCuentas.paginacion,
            code : "LISTADO_TIPOS_CUENTAS_OK"
        };
   };

   if ( listadoCuentas.code === 'NO_ACTIVE_TIPO_CUENTAS' ){
        return {
            error : true,
            message : "Sin listado de tipos de cuentas",
            code : "SIN_LISTADO_TIPOS_CUENTAS"
        };
   };

   return {
        error : true,
        message : "Errro en el servidor para obtener listado, intente nuevamente",
        code : "ERROR_SERVIDOR"
   };

};

export const method = {
    crearCuentaServicios : tryCatchDatos( crearCuentaEscuelaServicio ),
    modCuentaEscuelaServicio : tryCatchDatos(modCuentaEscuelaServicio),
    estadoCuentasEscuelaServicio : tryCatchDatos( estadoCuentasEscuela),
    listadoCuentasServicio : tryCatchDatos( listadoCuentas)
};