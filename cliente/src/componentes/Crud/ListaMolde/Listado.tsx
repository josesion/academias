// ListadoMolde.tsx
import { useRef, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { ItemGenerico } from "../ItemGenerico/ItemGenerico";
import { ComponenteCargando } from "../../generales/Cargando/Cargando";
import { SinResultado } from "../../generales/SinItemsListado/SinResultado";

import "./listaMolde.css";

type ListadoMoldeProps<T extends object> = {
  items: T[];
  carga: boolean;
  statusCode: number;
  error: boolean;
  botonEstado: string;
  onEditar?: (data: T) => void;
  onEliminar?: (data: T) => void;
};

// Rangos del efecto — tocá estos números para ajustar "qué tan agresiva"
// es la rueda sin tocar la lógica.
const CONFIG_RUEDA = {
  escalaMin: 0.72,
  opacidadMin: 0.3,
  rotacionMax: 34, // grados
  distanciaMaxima: 1.6, // en "alturas de ítem" — más allá de esto, todo queda en el mínimo
  umbralActiva: 0.18, // qué tan cerca del centro para considerarse "la activa"
};

export function ListadoMolde<T extends object>({
  items,
  carga,
  statusCode,
  onEditar,
  onEliminar,
  botonEstado,
}: ListadoMoldeProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string | number, HTMLDivElement>>(new Map());

  const setItemRef = useCallback(
    (key: string | number) => (el: HTMLDivElement | null) => {
      if (el) itemRefs.current.set(key, el);
      else itemRefs.current.delete(key);
    },
    [],
  );

  useGSAP(
    () => {
      const contenedor = containerRef.current;
      if (!contenedor || carga || statusCode === 404 || items.length === 0) {
        return;
      }

      const mm = gsap.matchMedia();
      let cleanupMovimiento: (() => void) | undefined;

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const elementos = Array.from(itemRefs.current.values());
        if (elementos.length === 0) return;

        // quickTo por elemento y por propiedad — cada uno interpola
        // suavemente hacia el valor que le calculemos en cada frame
        const setters = elementos.map((el) => ({
          el,
          scale: gsap.quickTo(el, "scale", {
            duration: 0.45,
            ease: "power3.out",
          }),
          opacity: gsap.quickTo(el, "opacity", {
            duration: 0.45,
            ease: "power3.out",
          }),
          rotateX: gsap.quickTo(el, "rotateX", {
            duration: 0.5,
            ease: "power3.out",
          }),
          z: gsap.quickTo(el, "z", { duration: 0.5, ease: "power3.out" }),
        }));

        const actualizar = () => {
          const rectContenedor = contenedor.getBoundingClientRect();
          const centroContenedor =
            rectContenedor.top + rectContenedor.height / 2;

          setters.forEach(({ el, scale, opacity, rotateX, z }) => {
            const rect = el.getBoundingClientRect();
            const centroItem = rect.top + rect.height / 2;

            // distancia normalizada: 0 = centrado, 1 = una altura de ítem
            // de distancia, etc.
            const distancia = (centroItem - centroContenedor) / rect.height;
            const distanciaAbs = Math.min(
              Math.abs(distancia) / CONFIG_RUEDA.distanciaMaxima,
              1,
            );

            const nuevaEscala = gsap.utils.interpolate(
              1,
              CONFIG_RUEDA.escalaMin,
              distanciaAbs,
            );
            const nuevaOpacidad = gsap.utils.interpolate(
              1,
              CONFIG_RUEDA.opacidadMin,
              distanciaAbs,
            );
            const nuevaRotacion =
              Math.sign(distancia) *
              gsap.utils.interpolate(0, CONFIG_RUEDA.rotacionMax, distanciaAbs);
            const nuevoZ = -distanciaAbs * 160; // profundidad: se aleja de cámara

            scale(nuevaEscala);
            opacity(nuevaOpacidad);
            rotateX(nuevaRotacion);
            z(nuevoZ);

            el.classList.toggle(
              "rueda_item--activa",
              Math.abs(distancia) < CONFIG_RUEDA.umbralActiva,
            );
          });
        };

        // scroll acoplado a rAF — evita recalcular más de una vez por frame
        let solicitado = false;
        const alScrollear = () => {
          if (solicitado) return;
          solicitado = true;
          requestAnimationFrame(() => {
            actualizar();
            solicitado = false;
          });
        };

        contenedor.addEventListener("scroll", alScrollear, { passive: true });

        const resizeObserver = new ResizeObserver(() => actualizar());
        resizeObserver.observe(contenedor);

        // estado inicial correcto antes del primer scroll del usuario
        actualizar();

        cleanupMovimiento = () => {
          contenedor.removeEventListener("scroll", alScrollear);
          resizeObserver.disconnect();
        };
      });

      // sin preferencia de movimiento: todo queda neutro, sin 3D
      mm.add("(prefers-reduced-motion: reduce)", () => {
        itemRefs.current.forEach((el) => {
          gsap.set(el, { scale: 1, opacity: 1, rotateX: 0, z: 0 });
        });
      });

      return () => {
        cleanupMovimiento?.();
        mm.revert();
      };
    },
    { scope: containerRef, dependencies: [carga, items, statusCode] },
  );

  return (
    <div className="rueda_contenedor" ref={containerRef}>
      {carga === true ? (
        <ComponenteCargando />
      ) : statusCode === 404 ? (
        <SinResultado />
      ) : (
        <>
          {/* espaciadores: permiten que el primer y último ítem lleguen
              al centro del carrusel — ver nota en el CSS */}
          <div className="rueda_espaciador" aria-hidden="true" />

          {items.map((item, idx) => {
            const key =
              typeof (item as any).id === "string" ||
              typeof (item as any).id === "number"
                ? (item as any).id
                : idx;

            return (
              <div className="rueda_item" key={key} ref={setItemRef(key)}>
                <ItemGenerico
                  data={item}
                  textoBoton={botonEstado}
                  onEditarButton={onEditar}
                  onEliminarButton={onEliminar}
                />
              </div>
            );
          })}

          <div className="rueda_espaciador" aria-hidden="true" />
        </>
      )}
    </div>
  );
}
