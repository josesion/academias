type AsyncFunction<T> = (...args: any[]) => Promise<T>; // Tipo genérico


import { ClientError } from "../utils/error";

export const tryCatchDatos = <T>(fn: AsyncFunction<T>, entidadNombre?: string, genero ?: "masculino" | "femenino") => {
    return async (...args: any[]) => {
        try {
            return await fn(...args);
        } catch (error: any) {
            let articulo , registro ;
            // Verifica un código de error de la base de datos para duplicados
            if (error.code === 'ER_DUP_ENTRY' || (error.errno && error.errno === 1062)) {
                if ( genero === "masculino") {  articulo = "Este" ; registro = "registrado"}
                else{ articulo = "Esta" ;  registro = "registrada" }
                // Lanza un ClientError específico con un mensaje dinámico
                const message = `${articulo} ${entidadNombre} ya se encuentra ${registro}`;
                throw new ClientError(message, 409, "DUPLICATE_ENTITY");
            }
            // Si es otro tipo de error de la base de datos, lo lanzas
            throw error;
        }
    };
};