// seccion de Bibliotecas
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// seccio de componentes
import { ItemGenerico } from "../ItemGenerico/ItemGenerico";
import { ComponenteCargando } from "../../generales/Cargando/Cargando";
import { SinResultado } from "../../generales/SinItemsListado/SinResultado";
// seccion de estilos
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

export function ListadoMolde<T extends object>({
  items,
  carga,
  statusCode,
  onEditar,
  onEliminar,
  botonEstado,
}: ListadoMoldeProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Entrada: los ítems vuelan desde los costados (alternando lado)
  //     hasta acomodarse en su lugar, con un leve rebote al llegar ---
  useGSAP(
    () => {
      if (carga || statusCode === 404 || items.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // posición real en el listado completo (no en el subconjunto
        // "nuevas") — así el patrón izquierda/derecha queda consistente
        // con la fila donde cae cada tarjeta, aunque solo se re-animen
        // las que son genuinamente nuevas
        const todas = gsap.utils.toArray<HTMLElement>(".item_card");
        const nuevas = todas.filter((el) => !el.dataset.animado);

        if (nuevas.length === 0) return;

        nuevas.forEach((el) => (el.dataset.animado = "true"));

        gsap.fromTo(
          nuevas,
          {
            opacity: 0,
            x: (_i, el) =>
              todas.indexOf(el as HTMLElement) % 2 === 0 ? -220 : 220,
            rotateZ: (_i, el) =>
              todas.indexOf(el as HTMLElement) % 2 === 0 ? -5 : 5,
            scale: 0.94,
          },
          {
            opacity: 1,
            x: 0,
            rotateZ: 0,
            scale: 1,
            duration: 0.75,
            stagger: { each: 0.09, ease: "power1.inOut" },
            ease: "back.out(1.5)",
            overwrite: "auto",
          },
        );
      });

      return () => mm.revert();
    },
    {
      scope: containerRef,
      dependencies: [carga, items],
    },
  );

  // --- Interacción magnética al hover — un solo listener para toda la
  //     lista (delegación de eventos), no uno por tarjeta ---
  useGSAP(
    () => {
      const contenedor = containerRef.current;
      if (!contenedor) return;

      if (
        !window.matchMedia("(prefers-reduced-motion: no-preference)").matches
      ) {
        return;
      }

      const alMover = (e: MouseEvent) => {
        const tarjeta = (e.target as HTMLElement).closest<HTMLElement>(
          ".item_card",
        );
        if (!tarjeta) return;

        const rect = tarjeta.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(tarjeta, {
          rotateY: relX * 6,
          rotateX: -relY * 6,
          transformPerspective: 700,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      const alSalir = (e: MouseEvent) => {
        const tarjeta = (e.target as HTMLElement).closest<HTMLElement>(
          ".item_card",
        );
        if (!tarjeta) return;

        gsap.to(tarjeta, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease: "power3.out",
        });
      };

      contenedor.addEventListener("mousemove", alMover);
      contenedor.addEventListener("mouseleave", alSalir, true);

      return () => {
        contenedor.removeEventListener("mousemove", alMover);
        contenedor.removeEventListener("mouseleave", alSalir, true);
      };
    },
    { scope: containerRef, dependencies: [carga, items] },
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
            <ItemGenerico
              key={key}
              data={item}
              textoBoton={botonEstado}
              onEditarButton={onEditar}
              onEliminarButton={onEliminar}
            />
          );
        })
      )}
    </div>
  );
}
