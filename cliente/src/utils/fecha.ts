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


/**
 * Calcula una fecha restando 6 meses a partir de una fecha base dada.
 * * @param {string} fechaBase - La fecha de referencia en formato 'YYYY-MM-DD'.
 * @returns {string} La nueva fecha calculada (6 meses atrás) en formato 'YYYY-MM-DD'.
 * * @example
 * // Si hoy es 2026-03-12
 * const resultado = calcularSeisMesesAtras("2026-03-12");
 * console.log(resultado); // "2025-09-12"
 * * @description
 * La función utiliza .replace(/-/g, '\/') para instanciar el objeto Date, 
 * evitando desfases de zona horaria (UTC vs Local) que ocurren habitualmente 
 * al parsear strings con guiones en JavaScript.
 */
export const calcularSeisMesesAtras = (fechaBase: string): string => {
    // 1. Creamos el objeto Date a partir del string recibido
    // Usamos el reemplazo de '-' por '/' para evitar problemas de zona horaria en JS
    const date = new Date(fechaBase.replace(/-/g, '\/')); 

    // 2. Restamos los 6 meses
    date.setMonth(date.getMonth() - 6);

    // 3. Extraemos las partes para el formato YYYY-MM-DD
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
};