import { useEffect, useRef } from "react";

/**
 * Elementos que pueden recibir foco dentro de un diálogo.
 *
 * Se excluyen los `[disabled]` y los que están fuera del flujo (por eso
 * `tabindex="-1"`, que justamente sirve para receives foco por script pero no
 * para el tabulador).
 */
const SELECTOR_FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface OpcionesModalAccesible {
  /**
   * Si el diálogo está abierto. **Obligatorio** porque estos modales se
   * renderizan con `{estado.modal.x && …}`: cuando la página monta el diálogo
   * todavía no existe en el DOM, así que el efecto tiene que volver a correr
   * cuando `abierto` pasa a `true` (y su limpieza, cuando vuelve a `false`, es
   * la que devuelve el foco).
   */
  abierto: boolean;
  /** Se llama cuando el usuario aprieta Escape. */
  onCerrar: () => void;
  /**
   * `false` = Escape NO cierra. Para los modales que son bloqueantes por
   * diseño (`ModalSinSuscripcion`), que no se pueden esquivar.
   * @default true
   */
  cerrable?: boolean;
}

/**
 * Devuelve el `ref` que hay que poner en el elemento del diálogo para que se
 * comporte bien con el teclado (spec 014).
 *
 * Hace cuatro cosas (WCAG 2.1.2 sin teclado, 2.4.3 orden del foco):
 *
 * 1. **Foco inicial**: al abrir, el foco entra al diálogo (al primer elemento
 *    focusable). Antes se quedaba atrás, invisible, y el usuario de teclado
 *    seguía escribiendo en el campo que estaba debajo del overlay.
 * 2. **Escape** cierra (salvo que `cerrable` sea `false`).
 * 3. **Trampa de foco**: Tab y Shift+Tab ciclan dentro del diálogo en vez de
 *    salirse a la página de atrás.
 * 4. **Devuelve el foco**: al cerrar, el foco vuelve al elemento que lo abrió
 *    (normalmente el botón de la fila), para no perder el lugar.
 *
 * Los atributos ARIA (`role="dialog"`, `aria-modal`, `aria-labelledby`) **no**
 * se ponen acá: son atributos de React y van en el JSX de cada modal.
 *
 * El `onCerrar` se guarda en un ref a propósito: los modales lo pasan como
 * arrow inline, así que si fuera dependencia del `useEffect` se re-ejecutaría
 * en cada render y el foco volvería al primer campo mientras el usuario escribe.
 *
 * @param {OpcionesModalAccesible} opciones - Qué hacer al abrir y al cerrar.
 * @returns {{ refDialog: React.RefObject<HTMLDivElement | null> }} El ref para
 *   el elemento que envuelve el contenido del diálogo.
 */
export const useModalAccesible = ({
  abierto,
  onCerrar,
  cerrable = true,
}: OpcionesModalAccesible) => {
  const refDialog = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef(onCerrar);

  // Siempre al día, pero sin disparar el efecto
  cerrarRef.current = onCerrar;

  useEffect(() => {
    // Cerrado: no hay diálogo al que meterle foco
    if (!abierto) return;

    // 1. Guardamos dónde estaba el foco para devolvérselo al cerrar
    const elementoOrigen = document.activeElement as HTMLElement | null;
    const dialogo = refDialog.current;

    // 2. Foco inicial: el primer focusable del diálogo
    dialogo?.querySelector<HTMLElement>(SELECTOR_FOCUSABLE)?.focus();

    const alTeclado = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        if (!cerrable) return;
        evento.preventDefault();
        cerrarRef.current();
        return;
      }

      if (evento.key !== "Tab" || !dialogo) return;

      // 3. Trampa de foco: si se intenta salir del diálogo, se vuelve al otro extremo.
      //    Se filtran los ocultos (`offsetParent === null`) para que el "primer" y el
      //    "último" del cálculo sean los que el usuario realmente puede pisar; el
      //    elemento con el foco se acepta siempre (puede estar en `position: fixed`).
      const focusables = Array.from(
        dialogo.querySelectorAll<HTMLElement>(SELECTOR_FOCUSABLE),
      ).filter((elemento) => elemento.offsetParent !== null || elemento === document.activeElement);

      if (focusables.length === 0) {
        // Sin nada focusable dentro: el foco queda atrapado en el diálogo
        evento.preventDefault();
        return;
      }

      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", alTeclado);

    return () => {
      document.removeEventListener("keydown", alTeclado);
      // 4. Devolvemos el foco a donde estaba
      elementoOrigen?.focus();
    };
    // `abierto` es lo único que puede cambiar en la vida del modal: el resto
    // (incluido `onCerrar`) llega fresco por el ref de arriba.
  }, [abierto, cerrable]);

  return { refDialog };
};