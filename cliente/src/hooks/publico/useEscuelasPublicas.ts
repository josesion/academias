import { useCallback, useEffect, useState } from "react";

import { getEscuelasPublicas } from "../../servicio/escuelas.publicas.fetch";
import type {
  EscuelaPublica,
  EscuelaPublicaRow,
  EstadoEscuelasPublicas,
  RubroTarjeta,
} from "../../tipadosTs/escuela.publica.typado";

/** Corta el request si el server no responde a tiempo (mismo criterio que `usePlanesPublicos`). */
const TIMEOUT_MS = 8000;

/** Texto que se muestra cuando la razón social viene nula o vacía. */
const ESCUELA_SIN_NOMBRE = "Escuela sin nombre";

/** Cantidad mínima de dígitos para que un `celular` sirva como `wa.me`. */
const MIN_DIGITOS_CELULAR = 8;

/** Largo de un celular local de Salta (`387XXXXXX`), sin código de país. */
const LARGO_CELULAR_LOCAL = 10;

/**
 * Recorta un texto opcional y lo convierte en `null` si queda vacío.
 *
 * @param crudo Valor tal como llega del JSON (`string` o `null`).
 * @returns El texto recortado, o `null` cuando no hay contenido útil.
 */
const textoONull = (crudo: string | null): string | null => {
  const texto = (crudo ?? "").trim();
  return texto === "" ? null : texto;
};

/**
 * Normaliza el `celular` de la escuela a los dígitos que acepta `wa.me`.
 *
 * Reglas (spec 054, `plan.md` §3.5):
 * - Se descarta todo lo que no sea dígito (`+`, espacios, guiones, paréntesis).
 * - Si ya empieza con `54` (código de país) se usa tal cual: no se duplica.
 * - 10 dígitos (celular local de Salta, `387XXXXXX`) ⇒ se antepone `549`.
 * - Cualquier otro largo ≥ 8 ⇒ se antepone `54`.
 * - Menos de 8 dígitos ⇒ `null`: la tarjeta no muestra el botón de WhatsApp.
 *
 * @param crudo Celular tal como llega del JSON (`string` o `null`).
 * @returns Los dígitos listos para `wa.me`, o `null` si no alcanzan.
 */
const normalizarCelular = (crudo: string | null): string | null => {
  const digitos = (crudo ?? "").replace(/\D/g, "");

  if (digitos.length < MIN_DIGITOS_CELULAR) return null;
  if (digitos.startsWith("54")) return digitos;
  if (digitos.length === LARGO_CELULAR_LOCAL) return `549${digitos}`;

  return `54${digitos}`;
};

/**
 * Traduce el rubro del server a la variante de la tarjeta.
 *
 * Solo `"baile"` y `"gym"` son válidos; cualquier otro valor se pinta como
 * `"desconocido"` (badge neutro "Escuela") sin romper el layout.
 *
 * @param crudo Rubro tal como llega del JSON.
 * @returns El rubro de la tarjeta.
 */
const normalizarRubro = (crudo: string | null): RubroTarjeta => {
  if (crudo === "baile" || crudo === "gym") return crudo;
  return "desconocido";
};

/**
 * Normaliza una fila cruda del endpoint a la forma que consume la tarjeta.
 *
 * Además arma las dos URLs externas:
 * - `whatsapp`: `https://wa.me/<dígitos>` o `null`.
 * - `maps`: búsqueda de Google Maps con la dirección + `, Salta, Argentina`,
 *   o `null` si no hay dirección (un link a `", Salta, Argentina"` no ubica
 *   nada y confunde).
 *
 * @param fila Fila cruda del listado público.
 * @returns La escuela normalizada, o `null` si el `id_escuela` no es un entero
 *          válido (evita `key` repetidas en la grilla).
 */
const normalizarEscuela = (fila: EscuelaPublicaRow): EscuelaPublica | null => {
  if (!Number.isInteger(fila.id_escuela)) return null;

  const direccion = textoONull(fila.direccion);
  const celular = normalizarCelular(fila.celular);

  return {
    id_escuela: fila.id_escuela,
    razon_social: textoONull(fila.razon_social) ?? ESCUELA_SIN_NOMBRE,
    direccion,
    urlImagen: textoONull(fila.urlImagen),
    rubro: normalizarRubro(fila.rubro),
    celularDigitos: celular ?? "",
    whatsapp: celular ? `https://wa.me/${celular}` : null,
    maps: direccion
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${direccion}, Salta, Argentina`
        )}`
      : null,
  };
};

/**
 * Mezcla una lista con el algoritmo Fisher-Yates (decisión 4 de la spec 054).
 *
 * Trabaja sobre una **copia**: nunca muta el array que devolvió el servicio.
 * Se llama **una sola vez por respuesta** (dentro del `setEscuelas`), así un
 * re-render o un cambio de tema no rebaraja la grilla.
 *
 * @param lista Lista a mezclar.
 * @returns Una copia nueva con el mismo contenido en otro orden.
 */
const mezclar = <T>(lista: T[]): T[] => {
  const copia = [...lista];

  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  return copia;
};

/**
 * Carga las escuelas públicas activas para el tarjetero del Login (spec 054).
 *
 * Es un único `GET` de lectura contra un catálogo público, así que va con
 * `useState` + `useEffect` + `AbortController` (mismo patrón que
 * `usePlanesPublicos`): no hay reducer que justifique `useEfectServicio`.
 *
 * El array se mezcla una sola vez por respuesta y las filas se normalizan
 * (razón social, dirección, celular, URLs y rubro) para que el componente solo
 * haga `.map()`.
 *
 * @returns Escuelas normalizadas y mezcladas, estado de carga, mensaje de
 *          error y un `recargar` para reintentar a mano.
 */
export const useEscuelasPublicas = (): EstadoEscuelasPublicas => {
  const [escuelas, setEscuelas] = useState<EscuelaPublica[]>([]);
  const [carga, setCarga] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disparo, setDisparo] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    // El cleanup lo pone en false: mientras siga en true somos el efecto vivo
    // (el abort pendiente es del timeout, no de un desmontaje).
    let vigente = true;

    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const pedir = async () => {
      setCarga(true);
      setError(null);

      const result = await getEscuelasPublicas(controller.signal);

      // Desmontados (o `StrictMode` remontó el efecto): no pintamos estados.
      if (!vigente) return;

      setCarga(false);

      // Una cancelación solo puede venir del timeout (el desmontaje ya se
      // filtró arriba con `vigente`).
      if (result.code === "REQUEST_ABORTED") {
        setEscuelas([]);
        setError("El servidor tardó demasiado en responder.");
        return;
      }

      if (result.error) {
        setEscuelas([]);
        setError(result.message || "No se pudieron cargar las escuelas.");
        return;
      }

      const normalizadas = (result.data ?? [])
        .map(normalizarEscuela)
        .filter((escuela): escuela is EscuelaPublica => escuela !== null);

      setEscuelas(mezclar(normalizadas));
    };

    pedir();

    return () => {
      vigente = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [disparo]);

  const recargar = useCallback(() => setDisparo((n) => n + 1), []);

  return { escuelas, carga, error, recargar };
};
