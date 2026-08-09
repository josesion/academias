// seccion de Bibliotecas
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// seccion de componentes
import { ItemGenerico } from "../ItemGenerico/ItemGenerico";
import { ComponenteCargando } from "../../generales/Cargando/Cargando";
import { SinResultado } from "../../generales/SinItemsListado/SinResultado";

// seccion de estilos
import "./listaMolde.css";

gsap.registerPlugin(ScrollTrigger);

const OFFSET_BASE = 20;
const OFFSET_PASO = 16;

type ListadoMoldeProps<T extends object> = {
  items: T[];
  carga: boolean;
  statusCode: number;
  error: boolean;
  botonEstado: string;
  onEditar?: (data: T) => void;
  onEliminar?: (data: T) => void;
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

  useGSAP(
    () => {
      // Limpiamos ScrollTriggers anteriores
      ScrollTrigger.getAll().forEach((t) => t.kill());

      if (carga || statusCode === 404 || items.length === 0) return;

      const tarjetas = gsap.utils.toArray<HTMLElement>(".item_stack_slot");
      if (tarjetas.length < 2) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        tarjetas.forEach((tarjeta, index) => {
          if (index === 0) return;

          const anterior = tarjetas[index - 1];
          const restoTop = OFFSET_BASE + index * OFFSET_PASO;

          // Animación de apilamiento: SOLO DESPLAZAMIENTO EN Y.
          // Eliminamos la animación de 'opacity' para que la tarjeta anterior
          // se mantenga 100% SÓLIDA Y OPACA mientras es tapada.
          gsap.fromTo(
            anterior,
            { y: 0 }, // Arranca en su posición normal
            {
              y: -6, // Se desplaza un pelín hacia arriba para dar efecto de profundidad, pero sin transparencia
              ease: "none",
              scrollTrigger: {
                trigger: tarjeta,
                start: "top bottom",
                end: `top ${restoTop}px`,
                scrub: true,
                // pin: false, // Ya no es necesario forzar el pin para la nitidez si no tocamos la opacidad
              },
            },
          );
        });
        ScrollTrigger.refresh();
      });

      return () => {
        mm.revert();
      };
    },
    {
      scope: containerRef,
      dependencies: [carga, items],
    },
  );

  return (
    <div className="listado_molde" ref={containerRef}>
      {carga === true ? (
        <ComponenteCargando />
      ) : statusCode === 404 ? (
        <SinResultado />
      ) : (
        items.map((item, idx) => {
          const key =
            typeof (item as any).id === "string" ||
            typeof (item as any).id === "number"
              ? (item as any).id
              : idx;

          return (
            <div
              className="item_stack_slot"
              key={key}
              style={{
                top: `${OFFSET_BASE + idx * OFFSET_PASO}px`,
                zIndex: idx + 1,
              }}
            >
              <ItemGenerico
                data={item}
                textoBoton={botonEstado}
                onEditarButton={onEditar}
                onEliminarButton={onEliminar}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
