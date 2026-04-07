import { method as  cuentasData} from "../data/cuentas.escuelas";

// hooks seccion -------------------------------------
import { tryCatchDatos } from "../utils/tryCatchBD";


// Tipados seccion -----------------------------------
import { CuentaEscuelaInput, CuentaEscuelaSchema,
         ModificarCuentaEscuelaUnputs, ModificarCuentaEscuelaSchema,
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


export const method = {
    crearCuentaServicios : tryCatchDatos( crearCuentaEscuelaServicio ),
    modCuentaEscuelaServicio : tryCatchDatos(modCuentaEscuelaServicio),
};