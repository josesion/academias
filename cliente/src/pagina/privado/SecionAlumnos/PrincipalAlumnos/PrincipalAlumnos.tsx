import { useEffect, useMemo, useRef, useState } from "react";
import {
  LuImageOff,
  LuBuilding2,
  LuCalendarX,
  LuSchool,
  LuClipboardList,
  LuClock,
  LuSearch,
  LuX,
  LuChevronsUpDown,
} from "react-icons/lu";

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
import { usePerfilRapido } from "../../../../hooks/SeccionAlumnos/usePerfilRapido";

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
      // Quitar espacios, guiones, parentesis y + inicial. Los parentesis van sin
      // barra: dentro de una clase de caracteres no hace falta escaparlos.
      const num = limpio.replace(/[\s\-()]/g, "").replace(/^\+/, "");
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
  const { perfil } = usePerfilRapido();

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

  /**
   * Estados para el buscador y ordenamiento de academias.
   */
  const [busquedaEscuelas, setBusquedaEscuelas] = useState("");
  const [ordenEscuelas, setOrdenEscuelas] = useState<"nombre" | "estado" | "dias">("nombre");
  const [ordenAscendente, setOrdenAscendente] = useState(true);

  /**
   * Lista de academias filtrada y ordenada según los criterios del toolbar.
   */
  const escuelasFiltradas = useMemo(() => {
    let resultado = [...escuelas];

    // Filtrar por nombre
    if (busquedaEscuelas.trim()) {
      const termino = busquedaEscuelas.toLowerCase().trim();
      resultado = resultado.filter((e) =>
        e.razon_social.toLowerCase().includes(termino)
      );
    }

    // Ordenar
    resultado.sort((a, b) => {
      switch (ordenEscuelas) {
        case "nombre":
          return ordenAscendente
            ? a.razon_social.localeCompare(b.razon_social)
            : b.razon_social.localeCompare(a.razon_social);
        case "estado": {
          const estadoOrden = { activos: 0, suspendido: 1, vencidos: 2 };
          const aEstado = estadoOrden[a.estado_inscripcion as keyof typeof estadoOrden] ?? 3;
          const bEstado = estadoOrden[b.estado_inscripcion as keyof typeof estadoOrden] ?? 3;
          return ordenAscendente ? aEstado - bEstado : bEstado - aEstado;
        }
        case "dias": {
          const aDias = a.dias_restantes ?? -1;
          const bDias = b.dias_restantes ?? -1;
          return ordenAscendente ? aDias - bDias : bDias - aDias;
        }
        default:
          return 0;
      }
    });

    return resultado;
  }, [escuelas, busquedaEscuelas, ordenEscuelas, ordenAscendente]);

  /**
   * Calcula la próxima clase del alumno a partir de las clases de hoy.
   * Ordena por hora y toma la primera que aún no haya pasado.
   * Si todas las clases de hoy ya pasaron, no muestra nada.
   */
  const proximaClase = useMemo(() => {
    if (!clasesHoy.length) return null;

    // Ordenar por hora (ascendente)
    const ordenadas = [...clasesHoy].sort((a, b) => a.hora.localeCompare(b.hora));

    // Hora actual en formato HH:mm para comparar
    const ahora = new Date();
    const horaActual =
      String(ahora.getHours()).padStart(2, "0") + ":" + String(ahora.getMinutes()).padStart(2, "0");

    // Buscar la primera clase cuya hora sea mayor o igual a la hora actual
    const siguiente = ordenadas.find((c) => c.hora >= horaActual);
    return siguiente ?? null;
  }, [clasesHoy]);

  /**
   * Calcula las métricas resumidas de todas las inscripciones activas
   * para mostrar en el bloque "Resumen del plan".
   */
  const resumenPlan = useMemo(() => {
    // Filtrar solo las academias con inscripción activa
    const activas = escuelas.filter(
      (e) => e.estado_inscripcion === "activos"
    );

    const academiasActivas = activas.length;

    // Clases disponibles: suma de (clases_plan - clases_asistidas) en cada inscripción
    let clasesDisponibles = 0;
    let clasesTotales = 0;
    for (const e of activas) {
      const plan = e.clases_plan ?? 0;
      const asistidas = e.clases_asistidas ?? 0;
      clasesTotales += plan;
      clasesDisponibles += Math.max(0, plan - asistidas);
    }

    // Próximo vencimiento: la inscripción con menos días restantes (que aún no venció)
    let proximoVencimiento = "";
    let minDiasRestantes = Infinity;
    for (const e of activas) {
      const dias = e.dias_restantes ?? Infinity;
      if (dias < minDiasRestantes && dias >= 0) {
        minDiasRestantes = dias;
        proximoVencimiento = e.fecha_vencimiento_plan ?? "";
      }
    }

    // Porcentaje general de consumo de clases
    const porcentajeConsumo = clasesTotales > 0
      ? Math.round(((clasesTotales - clasesDisponibles) / clasesTotales) * 100)
      : 0;

    return {
      academiasActivas,
      clasesDisponibles,
      proximoVencimiento,
      porcentajeConsumo,
    };
  }, [escuelas]);

  return (
    // NO va `<main>` ni `role="main"`: el layout ya aporta el unico landmark
    // `main` de la pagina (y es el destino del skip link). Un segundo `main`
    // anidado es invalido.
    <div className="principal-alumno-container">
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
          {/* Encabezado de bienvenida con datos del usuario y próxima clase */}
          {perfil && (
            <section className="saludo-seccion" aria-label="Bienvenida">
              <div className="saludo-contenido">
                <div className="saludo-texto">
                  <h2 className="saludo-titulo">
                    Bienvenido/a, {perfil.nombre} {perfil.apellido}
                  </h2>
                  <p className="saludo-sin-clase" style={{ margin: 0, opacity: 0.9 }}>
                    {perfil.correo}
                  </p>
                </div>

                {proximaClase && (
                  <div className="saludo-proxima-clase" aria-label="Próxima clase">
                    <span className="saludo-proxima-label">Próxima clase</span>
                    <span className="saludo-proxima-detalle">
                      {proximaClase.tipoBaile} — {proximaClase.nivel}
                    </span>
                    <span className="saludo-proxima-lugar">
                      {proximaClase.hora} · {proximaClase.profesor} · {proximaClase.academia}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Resumen del plan — métricas generales de todas las inscripciones */}
          {resumenPlan.academiasActivas > 0 && (
            <section className="resumen-plan-seccion" aria-label="Resumen del plan">
              <div className="resumen-plan-contenido">
                <h3 className="resumen-plan-titulo">Resumen de tus planes</h3>
                <div className="resumen-plan-grid">
                  <div className="resumen-plan-item">
                    <div className="resumen-plan_icono_box" aria-hidden="true">
                      <LuSchool size={20} />
                    </div>
                    <div className="resumen-plan_info">
                      <span className="resumen-plan_valor">{resumenPlan.academiasActivas}</span>
                      <span className="resumen-plan_label">Academias activas</span>
                    </div>
                  </div>

                  <div className="resumen-plan-item">
                    <div className="resumen-plan_icono_box" aria-hidden="true">
                      <LuClipboardList size={20} />
                    </div>
                    <div className="resumen-plan_info">
                      <span className="resumen-plan_valor">{resumenPlan.clasesDisponibles}</span>
                      <span className="resumen-plan_label">Clases disponibles</span>
                    </div>
                  </div>

                  <div className="resumen-plan-item">
                    <div className="resumen-plan_icono_box" aria-hidden="true">
                      <LuClock size={20} />
                    </div>
                    <div className="resumen-plan_info">
                      <span className="resumen-plan_valor">
                        {resumenPlan.proximoVencimiento
                          ? resumenPlan.proximoVencimiento.split('-').reverse().join('/')
                          : "—"}
                      </span>
                      <span className="resumen-plan_label">Próximo vencimiento</span>
                    </div>
                  </div>
                </div>

                {/* Barra de progreso general */}
                <div className="resumen-plan_barra" role="progressbar" aria-valuenow={resumenPlan.porcentajeConsumo} aria-valuemin={0} aria-valuemax={100} aria-label={`Consumo de clases: ${resumenPlan.porcentajeConsumo}%`}>
                  <div
                    className="resumen-plan_barra_fill"
                    style={{ width: `${resumenPlan.porcentajeConsumo}%` }}
                  />
                </div>
              </div>
            </section>
          )}

          {/* 1. Sección de Escuelas */}
          <section className="seccion-contenedor" aria-labelledby="escuelas-titulo">
            <h2 id="escuelas-titulo" className="seccion-titulo">Mis Academias</h2>

            {hayEscuelas && (
              <div className="escuelas-toolbar" role="search" aria-label="Buscar y ordenar academias">
                {/* Buscador */}
                <div className="escuelas-toolbar_buscar">
                  <span className="escuelas-toolbar_buscar_icono" aria-hidden="true">
                    <LuSearch size={16} />
                  </span>
                  <input
                    type="text"
                    className="escuelas-toolbar_buscar_input"
                    placeholder="Buscar academia por nombre…"
                    value={busquedaEscuelas}
                    onChange={(e) => setBusquedaEscuelas(e.target.value)}
                    aria-label="Buscar academia por nombre"
                  />
                  {busquedaEscuelas && (
                    <button
                      type="button"
                      className="escuelas-toolbar_buscar_limpiar"
                      onClick={() => setBusquedaEscuelas("")}
                      aria-label="Limpiar búsqueda"
                    >
                      <LuX size={16} />
                    </button>
                  )}
                </div>

                {/* Orden */}
                <div className="escuelas-toolbar_orden">
                  <select
                    className="escuelas-toolbar_orden_select"
                    value={ordenEscuelas}
                    onChange={(e) => setOrdenEscuelas(e.target.value as "nombre" | "estado" | "dias")}
                    aria-label="Ordenar por"
                  >
                    <option value="nombre">Nombre</option>
                    <option value="estado">Estado del plan</option>
                    <option value="dias">Días restantes</option>
                  </select>
                  <button
                    type="button"
                    className="escuelas-toolbar_orden_dir"
                    onClick={() => setOrdenAscendente((prev) => !prev)}
                    aria-label={ordenAscendente ? "Orden descendente" : "Orden ascendente"}
                    title={ordenAscendente ? "Ascendente (A→Z)" : "Descendente (Z→A)"}
                  >
                    <LuChevronsUpDown size={16} />
                  </button>
                </div>

                {/* Contador de resultados */}
                <p className="escuelas-toolbar_resultados">
                  {escuelasFiltradas.length} de {escuelas.length} academia{escuelas.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            <div
              className="grilla-escuelas"
              role="list"
              aria-label={hayEscuelas ? "Lista de academias donde estás inscripto" : "Sin academias inscriptas"}
            >
              {hayEscuelas ? (
                escuelasFiltradas.map((escuela) => (
                  <TarjetaEscuela
                    key={escuela.id_escuela}
                    carga={state.carga.metricas}
                    escuela={escuela}
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

          {/* 2. Sección de Clases de Hoy — movida arriba porque es info urgente */}
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

          {/* 3. Sección de Carrusel / Flayers */}
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

          {/* 4. Sección de anuncios (espacio publicitario global) — movida al final */}
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

        </>
      )}
    </div>
  );
};
