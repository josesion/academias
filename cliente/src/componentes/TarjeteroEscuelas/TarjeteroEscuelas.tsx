import { useEffect, useId, useState } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuGraduationCap,
  LuMapPin,
  LuMessageCircle,
  LuArrowRight,
} from "react-icons/lu";

import { obtenerIniciales } from "../SeccionAlumnos/InfoEscuela/InfoEscuela";
import { ComponenteCargando } from "../generales/Cargando/Cargando";
import { ModalRegistroGratuito } from "../ModalRegistroGratuito/ModalRegistroGratuito";
import { useEscuelasPublicas } from "../../hooks/publico/useEscuelasPublicas";
import type {
  EscuelaPublica,
  RubroTarjeta,
} from "../../tipadosTs/escuela.publica.typado";

import "./tarjetero_escuelas.css";

/** Emoji decorativo y texto visible de cada badge de rubro. */
const RUBRO_BADGE: Record<RubroTarjeta, { emoji: string; texto: string }> = {
  baile: { emoji: "💃", texto: "Baile" },
  gym: { emoji: "🏋️", texto: "Gimnasio" },
  desconocido: { emoji: "", texto: "Escuela" },
};

interface TarjetaEscuelaPublicaProps {
  /** Escuela ya normalizada por `useEscuelasPublicas`. */
  escuela: EscuelaPublica;
}

/**
 * Tarjeta individual del tarjetero público de escuelas (spec 054).
 *
 * Cabecera compacta: logo de 64 px (o las iniciales de la razón social cuando
 * no hay `urlImagen` o la imagen falla) a la izquierda, y a la derecha el
 * rubro, el nombre y la dirección. Debajo, cuando hay datos suficientes, los
 * dos enlaces externos: WhatsApp y "Cómo llegar" a Google Maps.
 *
 * Los dos botones son `<a href>` reales (nunca `<div onClick>`): se tabulan,
 * se activan con `Enter` y abren en pestaña nueva con
 * `rel="noopener noreferrer"`.
 *
 * @param escuela Escuela normalizada que se pinta en la tarjeta.
 */
const TarjetaEscuelaPublica = ({ escuela }: TarjetaEscuelaPublicaProps) => {
  const [errorImagen, setErrorImagen] = useState(false);

  const badge = RUBRO_BADGE[escuela.rubro];
  const mostrarImagen = Boolean(escuela.urlImagen) && !errorImagen;

  return (
    <div className="tarjeta_publica">
      <div className="tarjeta_publica_cabecera">
        <div className="tarjeta_publica_media">
          {mostrarImagen ? (
            <img
              className="tarjeta_publica_imagen"
              src={escuela.urlImagen ?? ""}
              // Decorativa: la razón social ya está en el <h3> de la tarjeta.
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setErrorImagen(true)}
            />
          ) : (
            <div className="tarjeta_publica_fallback" aria-hidden="true">
              {obtenerIniciales(escuela.razon_social)}
            </div>
          )}
        </div>

        <div className="tarjeta_publica_cuerpo">
          <span
            className={`tarjeta_publica_rubro tarjeta_publica_rubro--${escuela.rubro}`}
          >
            {badge.emoji !== "" && (
              <span aria-hidden="true">{badge.emoji}</span>
            )}
            {badge.texto}
          </span>

          <h3 className="tarjeta_publica_nombre" title={escuela.razon_social}>
            {escuela.razon_social}
          </h3>

          {escuela.direccion && (
            <p className="tarjeta_publica_direccion">
              <LuMapPin size={16} aria-hidden="true" />
              <span>{escuela.direccion}</span>
            </p>
          )}
        </div>
      </div>

      {(escuela.whatsapp || escuela.maps) && (
        <div className="tarjeta_publica_acciones">
          {escuela.whatsapp && (
            <a
              className="tarjeta_publica_accion tarjeta_publica_accion--whatsapp"
              href={escuela.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Escribir por WhatsApp a ${escuela.razon_social}`}
            >
              <LuMessageCircle size={16} aria-hidden="true" />
              WhatsApp
            </a>
          )}

          {escuela.maps && (
            <a
              className="tarjeta_publica_accion tarjeta_publica_accion--mapa"
              href={escuela.maps}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver la ubicación de ${escuela.razon_social} en Google Maps`}
            >
              <LuMapPin size={16} aria-hidden="true" />
              Cómo llegar
            </a>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Baraja un array de índices usando el algoritmo Fisher-Yates.
 * Retorna un nuevo array con los índices en orden aleatorio.
 *
 * @param longitud Cantidad de elementos a barajar.
 * @returns Array de índices barajados.
 */
function barajarIndice(longitud: number): number[] {
  const indices = Array.from({ length: longitud }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

interface EstadoVacioTarjeteroProps {
  /** Se ejecuta al pulsar "Comenzar ahora". */
  onComenzar: () => void;
}

/**
 * Estado vacío del tarjetero: card promocional cuando todavía no hay
 * escuelas publicadas.
 *
 * Toda la animación vive en `tarjetero_escuelas.css`: las tres `<span>` de
 * onda son decorativas (ondas tipo radar detrás del icono) y el contenedor
 * completo del icono va con `aria-hidden`, así que el lector de pantalla solo
 * anuncia el título, el texto y el botón.
 */
const EstadoVacioTarjetero = ({ onComenzar }: EstadoVacioTarjeteroProps) => {
  return (
    <div className="tarjetero_vacio_card">
      <div className="tarjetero_vacio_icono_wrap" aria-hidden="true">
        <span className="tarjetero_vacio_onda" />
        <span className="tarjetero_vacio_onda tarjetero_vacio_onda--2" />
        <span className="tarjetero_vacio_onda tarjetero_vacio_onda--3" />
        <span className="tarjetero_vacio_icono">
          <LuGraduationCap size={30} />
        </span>
      </div>

      <h3 className="tarjetero_vacio_titulo">Tu academia puede estar aquí</h3>
      <p className="tarjetero_vacio_subtitulo">
        Unite a las academias que ya gestionan sus actividades con ELPHIS.
        Registráte gratis y probá la plataforma por 30 días sin costo.
      </p>
      <button
        type="button"
        className="tarjetero_vacio_boton"
        onClick={onComenzar}
      >
        Comenzar ahora
        <LuArrowRight
          className="tarjetero_vacio_flecha"
          size={16}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

/**
 * Tarjetero público de escuelas y gimnasios del Login (spec 054).
 *
 * Consume `useEscuelasPublicas` internamente (**sin props**: tiene un solo
 * call site) y pinta un carrusel de tarjeta única que rota las escuelas
 * en orden aleatorio con auto-avance cada 6 segundos.
 *
 * Es un `<section>` con `<h2>` visible y `aria-labelledby`: no agrega un
 * `<main>` ni un `<h1>` nuevo (el layout y el Login ya aportan los suyos).
 * Mientras carga marca `aria-busy`; con error muestra el mensaje y un botón
 * "Reintentar" dentro de la sección, sin tocar el formulario de login.
 *
 * El carrusel pausa en hover/focus, respeta `prefers-reduced-motion`,
 * y ofrece navegación manual con flechas y dots indicadores.
 */
export const TarjeteroEscuelas = () => {
  const { escuelas, carga, error, recargar } = useEscuelasPublicas();
  const tituloId = useId();
  const [modalAbierto, setModalAbierto] = useState(false);

  // --- Estado del carrusel ---
  const [indiceActual, setIndiceActual] = useState(0);
  const [ordenBarajado, setOrdenBarajado] = useState<number[]>([]);
  const [pausado, setPausado] = useState(false);

  // Barajar al cargar las escuelas
  useEffect(() => {
    if (escuelas.length > 1) {
      setOrdenBarajado(barajarIndice(escuelas.length));
      setIndiceActual(0);
    }
  }, [escuelas]);

  // Auto-avance cada 6 segundos
  useEffect(() => {
    if (escuelas.length <= 1 || pausado) return;

    const intervalo = setInterval(() => {
      setIndiceActual((prev) => {
        const siguiente = prev + 1;
        // Si llegamos al final del array barajado, re-barajar
        if (siguiente >= ordenBarajado.length) {
          setOrdenBarajado(barajarIndice(escuelas.length));
          return 0;
        }
        return siguiente;
      });
    }, 6000);

    return () => clearInterval(intervalo);
  }, [escuelas.length, ordenBarajado.length, pausado]);

  // Handlers de navegación manual
  const irSiguiente = () => {
    if (escuelas.length <= 1) return;
    setIndiceActual((prev) => {
      const siguiente = prev + 1;
      if (siguiente >= ordenBarajado.length) {
        setOrdenBarajado(barajarIndice(escuelas.length));
        return 0;
      }
      return siguiente;
    });
  };

  const irAnterior = () => {
    if (escuelas.length <= 1) return;
    setIndiceActual((prev) => {
      if (prev === 0) {
        // Volver al final del array barajado actual
        return ordenBarajado.length - 1;
      }
      return prev - 1;
    });
  };

  const irADot = (indiceDot: number) => {
    setIndiceActual(indiceDot);
  };

  return (
    <>
      <section
        className="tarjetero"
        aria-labelledby={tituloId}
        aria-busy={carga}
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
        onFocusCapture={() => setPausado(true)}
        onBlurCapture={() => setPausado(false)}
      >
        <div className="tarjetero_encabezado">
          <h2 id={tituloId} className="tarjetero_titulo">
            Escuelas y gimnasios que confían en ELPHIS
          </h2>
          <p className="tarjetero_subtitulo">
            Estas academias ya usan nuestra plataforma para gestionar sus
            actividades.
          </p>
        </div>

        {carga ? (
          <ComponenteCargando local />
        ) : error ? (
          <div className="tarjetero_error">
            <p className="tarjetero_estado">{error}</p>
            <button
              type="button"
              className="tarjetero_reintentar"
              onClick={recargar}
            >
              Reintentar
            </button>
          </div>
        ) : escuelas.length === 0 ? (
          <EstadoVacioTarjetero onComenzar={() => setModalAbierto(true)} />
        ) : (
          <div
            className="tarjetero_carrusel"
            role="region"
            aria-label="Carrusel de escuelas"
          >
            {escuelas.length > 1 && ordenBarajado.length > 0 ? (
              <>
                {/* Flecha anterior */}
                <button
                  type="button"
                  className="tarjetero_flecha tarjetero_flecha--izq"
                  onClick={irAnterior}
                  aria-label="Escuela anterior"
                >
                  <LuChevronLeft size={24} aria-hidden="true" />
                </button>

                {/* Tarjeta activa */}
                <div className="tarjetero_carrusel_pista">
                  <TarjetaEscuelaPublica
                    key={escuelas[ordenBarajado[indiceActual]].id_escuela}
                    escuela={escuelas[ordenBarajado[indiceActual]]}
                  />
                </div>

                {/* Flecha siguiente */}
                <button
                  type="button"
                  className="tarjetero_flecha tarjetero_flecha--der"
                  onClick={irSiguiente}
                  aria-label="Escuela siguiente"
                >
                  <LuChevronRight size={24} aria-hidden="true" />
                </button>

                {/* Barra de progreso del auto-avance */}
                <div className="tarjetero_progreso" aria-hidden="true">
                  <i key={indiceActual} className="tarjetero_progreso_barra" />
                </div>

                {/* Dots indicadores */}
                <div
                  className="tarjetero_dots"
                  role="tablist"
                  aria-label="Escuelas"
                >
                  {ordenBarajado.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      role="tab"
                      className={`tarjetero_dot${idx === indiceActual ? " tarjetero_dot--activo" : ""}`}
                      onClick={() => irADot(idx)}
                      aria-label={`Ir a la escuela ${idx + 1} de ${ordenBarajado.length}`}
                      aria-selected={idx === indiceActual}
                    />
                  ))}
                </div>
              </>
            ) : (
              /* Una sola escuela o ordenBarajado aún vacío: tarjeta estática */
              <div className="tarjetero_carrusel_pista">
                <TarjetaEscuelaPublica
                  key={escuelas[0].id_escuela}
                  escuela={escuelas[0]}
                />
              </div>
            )}
          </div>
        )}
      </section>
      <ModalRegistroGratuito
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
      />
    </>
  );
};
