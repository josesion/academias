import { tryCatchDatos } from "../utils/tryCatchBD";

import { method as  cuentasData} from "../data/cuentas.escuelas";


const crearCuentaEscuelaServicio = async () => {
    
};



export const method = {
    crearCuentaServicios : tryCatchDatos( crearCuentaEscuelaServicio ),
};