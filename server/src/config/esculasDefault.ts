

// Constantes de configuración inicial por defecto (Backend / Reglas de Negocio)
export const CONFIG_ESCUELA_DEFAULT = {
    // 1. Niveles base (Recomendado: permitir modificar nombre, pero proteger si están en uso)
    niveles: [
        { nivel: "Desde cero", is_default: 1 },
        { nivel: "Principiante", is_default: 1 },
        { nivel: "Intermedio", is_default: 1 },
        { nivel: "Avanzado", is_default: 1 }
    ],

    // 2. Cuentas de la escuela (Críticas para la caja, prohibir eliminar si tienen saldo o movimientos)
    cuentas: [
        { nombre_cuenta: "efectivo", tipo_cuenta: "fisico" },
        { nombre_cuenta: "mercado pago", tipo_cuenta: "virtual" }
    ],

    // 3. Categorías de Caja del Sistema (¡PROHIBIDO eliminar o modificar nombres base!, categoria_sistema = 1)
    categoriasCaja: [
        { nombre_categoria: "Inscripcion", tipo_movimiento: "ingreso" },
        { nombre_categoria: "Anulacion Inscripcion", tipo_movimiento: "egreso" },
        { nombre_categoria: "Saldo Inicial", tipo_movimiento: "ingreso" }
    ],
};

