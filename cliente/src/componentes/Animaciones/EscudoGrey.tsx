import React, { useState, useEffect } from "react";
import "./LogoGamer.css";
import escudo from "./escudo.png";

export const EscudoGray = () => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Forzamos el tipado para que TS acepte las propiedades personalizadas
  const estiloContenedor = {
    "--x": mousePos.x,
    "--y": mousePos.y,
  } as React.CSSProperties;

  return (
    <div className="contenedor_logo" style={estiloContenedor}>
      <div className="super_aura"></div>
      <div className="particulas_fuga"></div>

      <div className="perspectiva_escudo">
        <div className="aura_trasera"></div>
        <img src={escudo} alt="logo gamer" className="logo_gamer_central" />
        <div className="escudo_glow"></div>
        <div className="particulas_frente"></div>
      </div>
    </div>
  );
};
