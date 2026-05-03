import type { MetricasCajaPanelPrincipal } from "../tipadosTs/caja.typado"; 



export const initialState = (config: { id_escuela: number, id_usuario: number }) => ({
    // Datos de Identidad
    dataCaja: { 
        id_caja: null, 
        id_escuela: config.id_escuela 
    },
    apertura: {
        id_escuela: config.id_escuela,
        estado: "abierta",
        id_usuario_apertura: config.id_usuario
    },

    // UI y Control de Flujo
    estadoCaja: "cerrada", // "abierta" | "cerrada" | "cargando"
    modales: {
        apertura: false,
        cierre: false
    },
    enviando: false,
    errorGenerico: null as string | null,

    // Datos de Negocio
    panelPrincipal: null as MetricasCajaPanelPrincipal[] | null,
    disparadorRefresco: 0
});