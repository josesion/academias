import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as categoriaCajaData } from "../data/categiria.cajas.data";

const altaCategoriaCajaServicio = async() => {
    console.log("servicio categorias caja");
    const resultadoCategoriaCaja = await categoriaCajaData.altaCategoriaCaja();
};

export const method = {
    altaCategoriaCajaServicio : tryCatchDatos(altaCategoriaCajaServicio),
};