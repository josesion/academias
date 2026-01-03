import { type Horas } from "../tipadosTs/horario";



export interface ResultHoras{
        hora_inicio : Horas  ,
        hora_fin : Horas 
};


/**
 * Toma una hora en formato "HH:mm" y devuelve un objeto con la hora 
 * de inicio y la hora de fin (una hora después).
 * * @param {Horas} hora - Ejemplo: "09:00" o "23:30"
 * @returns {ResultHoras}
 */
export const generarRangoUnaHora = (hora: Horas): ResultHoras   => {
    // 1. Validación de seguridad
    if (!hora || !hora.includes(":")) {
        return { hora_inicio: "--:--" as Horas, hora_fin: "--:--" as Horas};
    }

    // 2. Lógica de cálculo
    const [hh, mm] = hora.split(":");
    let h = parseInt(hh, 10);
    let hFin = h + 1;

    if (hFin >= 24) {
        hFin = 0;
    }

    // 3. Construcción de strings formateados
    const hInicioStr = `${hh.padStart(2, '0')}:${mm}`;
    const hFinStr = `${hFin.toString().padStart(2, '0')}:${mm}`;

 
    return {
        hora_inicio: hInicioStr as Horas,
        hora_fin: hFinStr as Horas
    };
};

// --- EJEMPLOS DE USO ---
// const resultado = generarRangoUnaHora("09:00");
// console.log(resultado); // { hora_inicio: "09:00", hora_fin: "10:00" }

// const noche = generarRangoUnaHora("23:00");
// console.log(noche);     // { hora_inicio: "23:00", hora_fin: "00:00" }