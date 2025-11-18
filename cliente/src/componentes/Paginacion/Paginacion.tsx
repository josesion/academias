import React, { useState } from 'react';

// Seccion iconos
import { CgChevronLeft, CgChevronRight } from 'react-icons/cg';

import "./paginacion.css"

// Componente Paginacion
type PaginacionProps = {
    paginaActual: number;
    contadorPagina: number;
    onPaginaCambiada: (pagina: number) => void;
};

export const Paginacion = ({ paginaActual, contadorPagina, onPaginaCambiada }: PaginacionProps) => {

    // Función para manejar los clics. Simplemente llama a la función pasada por prop.
    const handleClick = (numeroPagina: number) => {
        onPaginaCambiada(numeroPagina);
    };

    // Lógica para generar los números de página visibles
    const generarPaginasVisibles = () => {
        const paginas = new Set();
//        const maxBotones = 5; // Número máximo de botones de página visibles

        // Siempre incluimos la primera y la última página
        paginas.add(1);
        paginas.add(contadorPagina);

        // Agregamos un rango de páginas alrededor de la página actual
        for (let i = -1; i <= 1; i++) {
            if (paginaActual + i >= 1 && paginaActual + i <= contadorPagina) {
                paginas.add(paginaActual + i);
            }
        }

        // Agregamos los puntos suspensivos (...)
        const pagesArray = Array.from(paginas).sort((a, b) => a - b);
        
        // Verificamos si necesitamos agregar '...' en el inicio
        if (pagesArray[1] > 2) {
            pagesArray.splice(1, 0, '...');
        }
        
        // Verificamos si necesitamos agregar '...' al final
        if (pagesArray[pagesArray.length - 2] < contadorPagina - 1) {
            pagesArray.splice(pagesArray.length - 1, 0, '...');
        }

        return pagesArray;
    };

    const paginasVisibles = generarPaginasVisibles();

    return (
        <div className="paginacion_contenedor">
            <div className="paginacion_componente">
                <div className="paginacion_izquierda">
                    <button
                        onClick={() => handleClick(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className="btn_nav"
                    >
                        <CgChevronLeft size={22} />
                    </button>
                </div>
                <div className="paginacion_centro">
                    {paginasVisibles.map((item, index) => (
                        <React.Fragment key={index}>
                            {item === '...' ? (
                                <span className="puntos_suspensivos">...</span>
                            ) : (
                                <button
                                    onClick={() => handleClick(Number(item))}
                                    className={Number(item) === paginaActual ? "btn_seleccionado" : "btn_generico"}
                                >
                                    {item}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <div className="paginacion_derecha">
                    <button
                        onClick={() => handleClick(paginaActual + 1)}
                        disabled={paginaActual === contadorPagina}
                        className="btn_nav"
                    >
                        <CgChevronRight size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
};

