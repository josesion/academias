import { useEffect, useState } from "react";
import { asistenciasPorInscripcion } from "../../servicio/asistencia.fetch";
import type { AsistenciaInscripcionRow } from "../../tipadosTs/asistencia.typado";

/**
 * Extiende la fila de asistencia con el nombre de la academia para identificar
 * de dónde viene cada asistencia (el alumno puede tener varias inscripciones).
 */
export interface AsistenciaConEscuela extends AsistenciaInscripcionRow {
  id_escuela: number;
  nombre_escuela: string;
}

/**
 * Hook que trae las últimas asistencias de todas las inscripciones activas
 * del alumno. Combina los resultados de cada inscripción y los ordena por
 * fecha descendente (más reciente primero).
 *
 * @param inscripciones - Array de inscripciones activas con id_inscripcion, id_escuela y razon_social.
 */
export const useHistorialAsistencias = (inscripciones: Array<{
  id_inscripcion: number;
  id_escuela: number;
  razon_social: string;
}>) => {
  const [asistencias, setAsistencias] = useState<AsistenciaConEscuela[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no hay inscripciones, no hay nada que cargar
    const inscripcionesActivas = inscripciones.filter((i) => i.id_inscripcion != null);
    if (inscripcionesActivas.length === 0) {
      setAsistencias([]);
      setCargando(false);
      setError(null);
      return;
    }

    let cancelado = false;
    setCargando(true);
    setError(null);

    // Trae las asistencias de cada inscripción en paralelo
    const promesas = inscripcionesActivas.map(async (inscripcion) => {
      try {
        const resp = await asistenciasPorInscripcion({ id_inscripcion: inscripcion.id_inscripcion! });
        if (cancelado) return [];

        if (resp.error || !resp.data) {
          return [];
        }

        // Agrega la información de la escuela a cada asistencia
        return resp.data.map((a) => ({
          ...a,
          id_escuela: inscripcion.id_escuela,
          nombre_escuela: inscripcion.razon_social,
        }));
      } catch {
        if (!cancelado) return [];
        return [];
      }
    });

    Promise.all(promesas).then((resultados) => {
      if (cancelado) return;

      // Combina todas las asistencias y ordena por fecha descendente
      const todas = resultados.flat().sort((a, b) => {
        // Ordena por fecha (más reciente primero)
        const fechaCompare = b.fecha.localeCompare(a.fecha);
        if (fechaCompare !== 0) return fechaCompare;
        // Si la fecha es igual, ordena por hora
        return b.hora.localeCompare(a.hora);
      });

      setAsistencias(todas);
      setCargando(false);
    }).catch((err) => {
      if (!cancelado) {
        setError(err instanceof Error ? err.message : "Error al cargar asistencias");
        setCargando(false);
      }
    });

    return () => { cancelado = true; };
  }, [inscripciones]);

  return { asistencias, cargando, error };
};
