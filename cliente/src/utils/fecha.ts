/**
 * @function fechaHoy
 * @description Genera una cadena de texto representando la fecha en el q se usa la funcion.
 * La fecha resultante siempre será en formato "YYYY-01-01".
 *
 * @returns {string} La fecha formateada como "YYYY-MM-DD" para el 1 de enero del año siguiente.
 */
export const fechaHoy = () :string   =>{
        const today = new Date(); // Obtiene la fecha y hora actual del ordenador

        // Formatea la fecha a YYYY-MM-DD
        // Obtiene el año (ej. 2025)
        const year = today.getFullYear();
        // Obtiene el mes (0-11), así que sumamos 1 y le añadimos un '0' delante si es < 10
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        // Obtiene el día (1-31) y le añade un '0' delante si es < 10
        const day = today.getDate().toString().padStart(2, '0');

        // Combina las partes en el formato YYYY-MM-DD
    return  `${year}-${month}-${day}`;

        // Establece el estado con la fecha formateada
}

/**
 * Calcula la fecha de vencimiento sumando una cantidad de meses
 * a la fecha actual.  
 * 
 * Tiene en cuenta automáticamente el cambio de año y los desbordes
 * de meses (por ejemplo, sumar meses pasando de diciembre a enero).
 *
 * @param {number} meses - Cantidad de meses a sumar a la fecha actual.
 * @returns {string} Fecha resultante en formato `YYYY-MM-DD`.
 *
 * @example
 * fechaVencimiento(1);  // "2025-02-03"
 * fechaVencimiento(6);  // "2025-07-03"
 * fechaVencimiento(14); // "2026-03-03"
 */

export const fechaVencimiento = ( meses : number) : string=>{
        const today = new Date(); // Obtiene la fecha y hora actual del ordenador
        // Formatea la fecha a YYYY-MM-DD
        // Obtiene el año (ej. 2025)
        today.setMonth(today.getMonth() + meses);

        const year = today.getFullYear();
        // Obtiene el mes (0-11), así que sumamos 1 y le añadimos un '0' delante si es < 10
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        // Obtiene el día (1-31) y le añade un '0' delante si es < 10
        const day = today.getDate().toString().padStart(2, '0');



        return  `${year}-${month}-${day}`;

};
