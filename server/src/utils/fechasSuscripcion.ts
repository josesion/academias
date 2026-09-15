interface FechasSuscripcion {
    fecha_inscripcion: string;
    fecha_vencimiento: string;
}

export const generarFechasSuscripcion = (): FechasSuscripcion => {
    const hoy = new Date();
    
    // Formatear la fecha de hoy (YYYY-MM-DD)
    const anioHoy = hoy.getFullYear();
    const mesHoy = String(hoy.getMonth() + 1).padStart(2, '0');
    const diaHoy = String(hoy.getDate()).padStart(2, '0');
    const fecha_inscripcion = `${anioHoy}-${mesHoy}-${diaHoy}`;

    // Calcular un mes después para el vencimiento
    const vencimiento = new Date(hoy);
    vencimiento.setMonth(vencimiento.getMonth() + 1);
    
    const anioVen = vencimiento.getFullYear();
    const mesVen = String(vencimiento.getMonth() + 1).padStart(2, '0');
    const diaVen = String(vencimiento.getDate()).padStart(2, '0');
    const fecha_vencimiento = `${anioVen}-${mesVen}-${diaVen}`;

    return {
        fecha_inscripcion,
        fecha_vencimiento
    };
};