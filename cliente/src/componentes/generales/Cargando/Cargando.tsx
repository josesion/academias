import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./cargando.css";

export const ComponenteCargando = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cartelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respetar prefers-reduced-motion: si el usuario quiere menos movimiento, no animar
    const prefiereMenosMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefiereMenosMovimiento) return;

    const ctx = gsap.context(() => {
      // Animación de entrada fluida y elástica
      gsap.fromTo(
        cartelRef.current,
        { y: 20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
      );

      // Loop de flotación suave y orgánico
      gsap.to(cartelRef.current, {
        y: -6,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5,
      });
    }, containerRef);

    return () => ctx.revert(); // Limpieza al desmontar
  }, []);

  return (
    <div
      className="overlay_cargando"
      ref={containerRef}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Cargando contenido"
    >
      <div className="cartel_cargando" ref={cartelRef}>
        <div className="spinner" aria-hidden="true" />
        <p className="texto_cargando">
          Cargando
          <span className="punto" />
          <span className="punto" />
          <span className="punto" />
        </p>
      </div>
    </div>
  );
};