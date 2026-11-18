import { useEffect, useState } from "react";
import { getMiPerfil } from "../../servicio/usuario.perfil.fetch";

/**
 * Datos mínimos del perfil para mostrar en el panel del alumno.
 * Solo nombre, apellido y correo (sin toda la lógica de edición).
 */
export interface PerfilRapido {
  nombre: string;
  apellido: string;
  correo: string;
}

/**
 * Hook ligero que trae solo los datos básicos del perfil del usuario.
 * No usa el reducer completo de edición de perfil, solo un GET simple.
 */
export const usePerfilRapido = () => {
  const [perfil, setPerfil] = useState<PerfilRapido | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      try {
        const resp = await getMiPerfil();
        if (cancelado) return;

        if (resp.error || !resp.data) {
          setError(resp.message ?? "No se pudo cargar el perfil");
          return;
        }

        const { nombre, apellido, correo } = resp.data;
        setPerfil({ nombre, apellido, correo });
      } catch (err) {
        if (!cancelado) {
          setError(err instanceof Error ? err.message : "Error al cargar perfil");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargar();
    return () => { cancelado = true; };
  }, []);

  return { perfil, cargando, error };
};
