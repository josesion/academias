import { useState, useCallback, useEffect, useRef } from "react";
import { inscripcionesDashboard } from "../../servicio/inscripciones.fetch";
import type { InscripcionDashboard, FiltroInscripcionDashboard } from "../../tipadosTs/inscripciones";

/**
 * Hook para gestionar el listado de inscripciones del dashboard.
 *
 * Maneja la carga, el filtro y la actualización de las últimas inscripciones
 * mostradas en el panel principal del usuario.
 *
 * @returns Estado y funciones para controlar el listado de inscripciones.
 */
export function useInscripcionesDashboard() {
    const [inscripciones, setInscripciones] = useState<InscripcionDashboard[]>([]);
    const [carga, setCarga] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtro, setFiltro] = useState<FiltroInscripcionDashboard>("todos");
    const abortRef = useRef<AbortController | null>(null);
    const cargaInicialRef = useRef(true);

    const cargarInscripciones = useCallback(async (filtroActivo: FiltroInscripcionDashboard) => {
        // Cancela la petición anterior si aún está en curso
        if (abortRef.current) {
            abortRef.current.abort();
        }

        const controller = new AbortController();
        abortRef.current = controller;

        // Solo mostrar skeleton en la carga inicial, no al cambiar de filtro
        const esCargaInicial = cargaInicialRef.current;
        if (esCargaInicial) {
            setCarga(true);
        }
        setError(null);

        try {
            const respuesta = await inscripcionesDashboard(filtroActivo, 20, controller.signal);

            if (!controller.signal.aborted) {
                if ('data' in respuesta) {
                    setInscripciones(respuesta.data ?? []);
                };
                setCarga(false);
                cargaInicialRef.current = false;
            }
        } catch (err) {
            if (!controller.signal.aborted) {
                setError(err instanceof Error ? err.message : "Error al cargar inscripciones");
                setCarga(false);
                cargaInicialRef.current = false;
            }
        }
    }, []);

    const cambiarFiltro = useCallback((nuevoFiltro: FiltroInscripcionDashboard) => {
        setFiltro(nuevoFiltro);
        cargarInscripciones(nuevoFiltro);
    }, [cargarInscripciones]);

    useEffect(() => {
        cargarInscripciones("todos");

        return () => {
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, [cargarInscripciones]);

    return {
        inscripciones,
        carga,
        error,
        filtro,
        cambiarFiltro,
    };
}
