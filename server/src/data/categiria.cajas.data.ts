import { tryCatchDatos } from "../utils/tryCatchBD"; 


const altaCategoriaCaja = async() => {
    console.log("CAtegorias caja data")
};

export const method = {
    altaCategoriaCaja : tryCatchDatos(altaCategoriaCaja),
};