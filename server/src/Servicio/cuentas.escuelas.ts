import { method as  cuentasData} from "../data/cuentas.escuelas";

// hooks seccion -------------------------------------
import { tryCatchDatos } from "../utils/tryCatchBD";


// Tipados seccion -----------------------------------
import { CuentaEscuelaInput, CuentaEscuelaSchema,
         ModificarCuentaEscuelaUnputs, ModificarCuentaEscuelaSchema,
         EstadoCuentasInputs, EstadoCuentasSchema,
         ListadoCuentasInputs, ListadoCuentasSchema,
 } from "../squemas/cuentas.escuelas"; 
import { TipadoData } from "../tipados/tipado.data";


/**
 * Servicio principal para la creación de una nueva cuenta/billetera de escuela.
 * * Flujo de ejecución:
 * 1. Formatea y limpia los datos de entrada.
 * 2. Valida contra el esquema Zod (tipos, longitudes y enums).
 * 3. Verifica la existencia previa del nombre para evitar duplicados en la misma escuela.
 * 4. Inserta en la base de datos si todas las validaciones pasan.
 * * @param {CuentaEscuelaInput} dataCuenta - Objeto con los datos de la cuenta (id_escuela, nombre, tipo, estado).
 * @returns {Promise<{error: boolean, message: string, code: string, data?: any}>} 
 * Objeto estandarizado de respuesta con códigos de éxito o error para el controlador.
 */
const crearCuentaEscuelaServicio = async ( dataCuenta : CuentaEscuelaInput)
: Promise<TipadoData<{ nombre_cuenta : string , tipo_cuenta : string }>> => {
 
  const data  ={
    id_escuela : dataCuenta.id_escuela,
    nombre_cuenta : dataCuenta.nombre_cuenta,
    tipo_cuenta : dataCuenta.tipo_cuenta,
    estado : dataCuenta.estado || "activos"
  };  

  const validarDatos : CuentaEscuelaInput = CuentaEscuelaSchema.parse(data);

  const filtroDuplicado = await  cuentasData.verificarCuentaEscuela(
         validarDatos.nombre_cuenta,
         validarDatos.id_escuela
  );


  if ( filtroDuplicado.code ===  "CUENTAS_NO_EXISTE" ){
   
     const registroCuenta = await cuentasData.crearCuentaEscuela(validarDatos);

     if ( registroCuenta.code === "CUENTAS_CREAR"){
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

const estadoCuentasEscuela = async ( dataEstado : EstadoCuentasInputs)
: Promise<TipadoData<{ id_cuenta : number , estado : string}>>  =>{
   const validarDatos : EstadoCuentasInputs = EstadoCuentasSchema.parse( dataEstado);
  // console.log( "datos validados", validarDatos)
   const modEstadoCuenta = await cuentasData.estadoCuenta( validarDatos);

   if ( modEstadoCuenta.code === "CUENTAS_MODIFICAR"){
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
    const offsetCalculado = ( Number(params.pagina) -1 ) * Number(params.limite) ;
    const dataParceada = { ...params, offset : offsetCalculado} 
    const validarData : ListadoCuentasInputs = ListadoCuentasSchema.parse(dataParceada);
   
    const listadoCuentas = await cuentasData.listdoCuentasDatos(validarData);
    console.log(listadoCuentas)
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