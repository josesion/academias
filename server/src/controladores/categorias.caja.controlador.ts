import { tryCatch } from "../utils/tryCatch";
import { method as categoriaCajaServicio } from "../Servicio/categoria.cajas.serivcio";


const altaCategoriaCaja = async() => {
    console.log("controlador categorias caja");
    const resutadoCategoriaCaja = await categoriaCajaServicio.altaCategoriaCajaServicio();
};


export const method = {
    altaCategoriaCaja : tryCatch(altaCategoriaCaja),
};


