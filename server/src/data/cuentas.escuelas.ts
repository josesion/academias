
// Hooks seccion 
import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";

// Tipados seccion
import { TipadoData } from "../tipados/tipado.data"; 
import { CuentaEscuelaInput } from "../squemas/cuentas.escuelas";

const crearCuentaEscuela = async (cuentaData: CuentaEscuelaInput) 
: Promise<TipadoData<{nombre_cuenta: string, tipo_cuenta: string}>> =>{
    const sql  : string  =`INSERT INTO cuentas_escuela (id_escuela, nombre_cuenta, tipo_cuenta, estado) 
                                VALUES 
                                ( ?, ?, ?, ? )`;
    const { id_escuela, nombre_cuenta, tipo_cuenta, estado} = cuentaData ;                            
    const parametros : unknown[] = [ id_escuela, nombre_cuenta, tipo_cuenta, estado];
    const retorno  = { nombre_cuenta, tipo_cuenta};
    return await iudEntidad<{nombre_cuenta: string, tipo_cuenta: string}>({
        slqEntidad : sql,
        valores : parametros,
        entidad : "CUENTAS",
        metodo : "CREAR",
        datosRetorno : retorno,
    });
};

enum TipoCuenta {
  fisico = 'fisico',
  virtual = 'virtual'
};

const verificarCuentaEscuela = async ( nombreCuenta : string , tipo : TipoCuenta , idEscuela : number) =>{
     const sql  : string  =`select id_cuenta from cuentas_escuela
                            where nombre_cuenta = ?  and tipo_cuenta = ?  and id_escuela = ? ;`;
     const parametros : unknown[] = [nombreCuenta, tipo, idEscuela];
     return buscarExistenteEntidad<{id_cuenta : number}>({
        slqEntidad : sql,
        valores : parametros,
        entidad : "CUENTAS"
     })
};


export const method = {
    crearCuentaEscuela : tryCatchDatos( crearCuentaEscuela ),
    verificarCuentaEscuela : tryCatchDatos( verificarCuentaEscuela ),
};