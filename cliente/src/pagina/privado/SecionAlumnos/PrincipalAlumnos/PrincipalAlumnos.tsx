import { useEffect, useRef, useState } from "react";
import { LuImageOff, LuBuilding2, LuCalendarX } from "react-icons/lu";

import { TarjetaEscuela } from "../../../../componentes/SeccionAlumnos/TarjetaEscuelas/TarjetasEscuelas";
import { TarjetaClaseHoy } from "../../../../componentes/SeccionAlumnos/TajertasClasesHoy/TarjetaClaseHoy";
import { CarruselFlayers } from "../../../../componentes/Flayers/Carrucel/CarruselFlayers";
import { EstadoVacio } from "../../../../componentes/SeccionAlumnos/EstadoVacio/EstadoVacio";
import {
  GaleriaComunidad,
  type EmprendedorItem,
} from "../../../../componentes/SeccionAlumnos/Publicidad/BanerPublicitario";
import { useAmbAnunciosPublicos } from "../../../../hookNegocios/abmAnunciosPublicos";
import type { FilaAnuncioPublico, TipoContacto } from "../../../../servicio/anuncios.publico.fetch";

import "./principalalumno.css";

import { configMetricasAlumnos } from "../../../../hookNegocios/metricas.alumnos";

/**
 * Normaliza el valor crudo que viene de la BD (username, handle, número)
 * a una URL completa y válida para la red social correspondiente.
 *
 * @param tipo - Tipo de red social (whatsapp | instagram | facebook)
 * @param valor - Valor crudo de la BD (puede ser null, username, o ya una URL)
 * @returns URL completa lista para usar en `href`, o `undefined` si no hay valor
 */
const normalizarUrlRed = (tipo: TipoContacto, valor: string | null): string | undefined => {
  if (!valor || !valor.trim()) return undefined;

  const limpio = valor.trim();

  // Si ya es una URL completa (http/https), respetarla tal cual
  if (limpio.startsWith("http")) return limpio;

  switch (tipo) {
    case "instagram": {
      // Quitar @ inicial si viene
      const user = limpio.replace(/^@/, "");
      return `https://instagram.com/${user}`;
    }
    case "facebook": {
      const user = limpio.replace(/^@/, "");
      return `https://facebook.com/${user}`;
    }
    case "whatsapp": {
      // Quitar espacios, guiones, paréntesis y + inicial
      const num = limpio.replace(/[\s\-\(\)]/g, "").replace(/^\+/, "");
      return `https://wa.me/${num}`;
    }
    default:
      return undefined;
  }
};

/**
 * Mapea una fila de `GET /api/anuncio_lista_publico` al item que
 * pinta la galería de anuncios (spec 018).
 *
 * El botón de contacto apunta a la red que dice `tipo_contacto`: la
 * URL real sale de la columna de esa red en `empresas`, y si la
 * empresa no la tiene cargada (NULL) el botón no se muestra.
 *
 * `texto_boton` no se setea: `GaleriaComunidad` ya tiene el texto
 * por defecto de cada red (lo define el mapa `REDES` del componente),
 * así que no hace falta duplicar los strings acá.
 *
 * @param fila - Anuncio con el `razon_social` y las redes de la empresa.
 * @returns Item de la galería (`EmprendedorItem`).
 */
const aItemDeGaleria = (fila: FilaAnuncioPublico): EmprendedorItem => {
  const red = fila.tipo_contacto;
  const valorRed =
    red === "whatsapp"
      ? fila.whatsapp
      : red === "instagram"
        ? fila.instagram
        : fila.facebook;

  return {
    id: fila.id_anuncio,
    nombre_emprendedor: fila.razon_social ?? "",
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    tipo: fila.tipo_media,
    url_media: fila.media_url,
    tipo_contacto: fila.tipo_contacto,
    link_accion: normalizarUrlRed(red, valorRed),
  };
};

export const PrincipalAlumnos = () => {
  const { state } = configMetricasAlumnos();
  const { data } = state;

  // Estado de visibilidad del banner publicitario (solo sesión actual, sin localStorage)
  const [bannerVisible, setBannerVisible] = useState(true);

  // Anuncios reales del carrusel (spec 018): reemplazan al mock.
  // El listado ACUMULA páginas (no reemplaza) para que el carrusel
  // no se reinicie cuando el usuario llega al final.
  const { state: anuncios, cargarMas } = useAmbAnunciosPublicos();

  const itemsDeGaleria = anuncios.listado.map(aItemDeGaleria);

  const handleBannerClose = () => {
    setBannerVisible(false);
  };

  // Centinela del carrusel: cuando el usuario se acerca al final
  // (200px antes) y todavía hay más anuncios, se pide la página
  // siguiente. Se reconecta solo cuando cambian esas condiciones.
  const centinelaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const centinela = centinelaRef.current;
    if (!centinela) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        if (
          entradas[0].isIntersecting &&
          anuncios.hayMas &&
          !anuncios.carga.listado
        ) {
          cargarMas();
        }
      },
      { rootMargin: "200px" }
    );

    observador.observe(centinela);
    return () => observador.disconnect();
  }, [anuncios.hayMas, anuncios.carga.listado, cargarMas]);

  const hayEscuelas = data?.escuelas && data.escuelas.length > 0;
  const hayFlayers = data?.flayers && data.flayers.length > 0;
  const hayClases = data?.clasesHoy && data.clasesHoy.length > 0;
  const cargandoInicial = state.carga.metricas;

  // Arrays tipados para TypeScript (evita "possibly null" en los map)
  const escuelas = data?.escuelas ?? [];
  const flayers = data?.flayers ?? [];
  const clasesHoy = data?.clasesHoy ?? [];

  return (
    <main className="principal-alumno-container" id="contenido-principal" role="main">
      {/* Encabezado de página con título principal para jerarquía semántica */}
      <header className="pagina-header" hidden>
        <h1>Panel del Alumno</h1>
      </header>

      {/* Indicador de carga global (solo en carga inicial) */}
      {cargandoInicial && (
        <div className="carga-global" role="status" aria-live="polite" aria-label="Cargando panel del alumno">
          <div className="carga-global_spinner" aria-hidden="true" />
          <span className="carga-global_texto">Cargando tu panel…</span>
        </div>
      )}

      {!cargandoInicial && (
        <>
          {/* 1. Sección de Escuelas */}
          <section className="seccion-contenedor" aria-labelledby="escuelas-titulo">
            <h2 id="escuelas-titulo" className="seccion-titulo">Mis Academias</h2>
            <div
              className="grilla-escuelas"
              role="list"
              aria-label={hayEscuelas ? "Lista de academias donde estás inscripto" : "Sin academias inscriptas"}
            >
              {hayEscuelas ? (
                escuelas.map((escuela) => (
                  <TarjetaEscuela
                    carga={state.carga.metricas}
                    id_escuela={escuela.id_escuela}
                    key={escuela.id_escuela}
                    dniPropietario={escuela.dni_propietario}
                    nombrePropietario={escuela.nombre_propietario}
                    apellidoPropietario={escuela.apellido_propietario}
                    razonSocial={escuela.razon_social}
                    direccion={escuela.direccion}
                    celular={escuela.celular}
                  />
                ))
              ) : (
                <EstadoVacio
                  icono={<LuBuilding2 size={26} />}
                  titulo="Todavía no estás inscripto en ninguna academia"
                  mensaje="Explorá las academias disponibles para empezar."
                  variante="compacto"
                />
              )}
            </div>
          </section>

          {/* 2. Sección de Carrusel / Flayers */}
          <section className="seccion-carrucel" aria-labelledby="flayers-titulo">
            <h2 id="flayers-titulo" className="seccion-titulo visually-hidden">Novedades y Flyers</h2>
            {hayFlayers ? (
              <CarruselFlayers
                flayers={flayers}
                tipo="carrusel"
                cargaSpiner={state.carga.metricas}
              />
            ) : (
              <div className="flayers_vacio_compacto" role="status" aria-label="Sin novedades disponibles">
                <div className="flayers_vacio_icono_box" aria-hidden="true">
                  <LuImageOff size={18} />
                </div>
                <div className="flayers_vacio_info">
                  <span className="flayers_vacio_titulo">Sin novedades</span>
                  <span className="flayers_vacio_sub">
                    Las academias aún no publicaron flyers
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* 3. Sección de anuncios (espacio publicitario global) */}
          <section className="seccion-contenedor" aria-labelledby="anuncios-titulo">
            <h2 id="anuncios-titulo" className="seccion-titulo visually-hidden">Espacio Publicitario</h2>
            <GaleriaComunidad
              items={itemsDeGaleria}
              cargando={anuncios.carga.listado}
              error={anuncios.error.listado}
              total={anuncios.paginacion.totalRegistros}
              initiallyVisible={bannerVisible}
              onClose={handleBannerClose}
            />

            {/* Centinela invisible: marca el final del carrusel para el
                IntersectionObserver (spec 018). */}
            <div ref={centinelaRef} className="anuncios_centinela" aria-hidden="true" />
          </section>

          {/* 4. Sección de Clases de Hoy */}
          <section className="seccion-contenedor" aria-labelledby="clases-titulo">
            <h2 id="clases-titulo" className="seccion-titulo">Clases Programadas para Hoy</h2>
            <div
              className="grilla-clases"
              role="list"
              aria-label={hayClases ? "Clases programadas para hoy" : "Sin clases programadas para hoy"}
            >
              {hayClases ? (
                clasesHoy.map((clase, index) => (
                  <TarjetaClaseHoy
                    carga={state.carga.metricas}
                    key={index}
                    hora={clase.hora}
                    academia={clase.academia}
                    tipoBaile={clase.tipoBaile}
                    nivel={clase.nivel}
                    profesor={clase.profesor}
                  />
                ))
              ) : (
                <EstadoVacio
                  icono={<LuCalendarX size={26} />}
                  titulo="No tenés clases programadas para hoy"
                  mensaje="Revisá tus horarios para ver las próximas fechas."
                  variante="compacto"
                />
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
};
