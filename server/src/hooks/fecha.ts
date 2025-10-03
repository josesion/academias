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