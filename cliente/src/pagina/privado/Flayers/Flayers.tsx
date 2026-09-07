import { confiFlayer } from "../../../hookNegocios/flayers";

import { SpinnerTarjeta } from "../../../componentes/Metricas/SipinnerMetricas/SpinnerTajetas";
import { LienzoImagen } from "../../../componentes/Flayers/ImagenSector/ImagenSector";
import { FormularioFlayer } from "../../../componentes/Flayers/FormularioFlayer/FormularioFlayer";
import { CompoError } from "../../../componentes/generales/Error/Error";
import { ModalConfirmacion } from "../../../componentes/Flayers/Confirmacion/Confirmacion";
import { CarruselFlayers } from "../../../componentes/Flayers/Carrucel/CarruselFlayers";
import { Boton } from "../../../componentes/generales/Boton/Boton";
import { LuX } from "react-icons/lu";

import "./flayer.css";

export const FlayersPag = () => {
  const {
    state,
    cachearFormulario,
    cachearImagen,
    quitarImagen,
    handleSubmit,
    handleElimnarFlayer,
    handleCerrarModal,
    abrirFormulario,
    cerrarFormulario,
  } = confiFlayer();

  console.log(state.errorGenericos.postImagen);

  return (
    <section className="flayers_pagina">
      {/* 1. MODAL DE CONFIRMACIÓN (Ubicado arriba de todo para evitar solapamientos) */}
      <ModalConfirmacion
        abierto={state.modalConfirmacion}
        onCerrar={handleCerrarModal}
      />

      {/* HEADER DE LA VISTA + BOTÓN 100% VISUAL */}
      <div className="flayers_vista_header">
        <div>
          <h2 className="flayers_creacion_titulo">Gestión de Flyers</h2>
          <p className="flayers_creacion_subtitulo">
            Administra tus publicaciones y carrusel
          </p>
        </div>
        <Boton
          clase="agregar"
          focus={true}
          logo="Add"
          texto="Agregar Flayer"
          type="button"
          onClick={abrirFormulario}
        />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flayers_pagina_contenido">
        {/* MODAL: FORMULARIO DE CREACIÓN (overlay + centrado) */}
        {state.modalFormulario && (
          <div className="flayers_modal_overlay" onClick={cerrarFormulario}>
            <div
              className="flayers_seccion_creacion"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="flayers_modal_btn_cerrar"
                type="button"
                onClick={cerrarFormulario}
                aria-label="Cerrar formulario"
              >
                <LuX size={18} />
              </button>

              <div className="flayers_creacion_header">
                <h3 className="flayers_creacion_titulo">Nuevo Flyer</h3>
                <p className="flayers_creacion_subtitulo">
                  Carga tu imagen y completa los datos para publicar
                </p>
              </div>

              <div className="flayers_creacion_grid">
                {/* LIENZO */}
                <div className="flayers_pagina_lienzo">
                  <LienzoImagen
                    onChangeImagen={cachearImagen}
                    imagen={state.imagen}
                    quitarImagen={quitarImagen}
                  />
                </div>

                {/* FORMULARIO */}
                <div className="flayers_pagina_formulario">
                  <FormularioFlayer
                    detallesErrores={state.errorDetalles}
                    onChangeTitulo={cachearFormulario}
                    valores={state.valoresFormulario}
                    onSubmit={handleSubmit}
                    carga={state.carga.postImagen}
                  />
                </div>
              </div>

              {/* ERROR (ahora dentro del modal, donde ocurre la acción) */}
              {state.errorGenericos.postImagen && (
                <div className="flayers_pagina_error">
                  <CompoError mensaje={state.errorGenericos.postImagen} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* GALERÍA / CARRUSEL */}
        <div className="flayers_pagina_galeria">
          <div className="flayers_galeria_header">
            <p className="flayers_galeria_subtitulo">
              Flyers publicados recientemente
            </p>
          </div>

          <div className="carrusel_flayers_contenendor">
            {state.carga.galeria ? (
              <SpinnerTarjeta />
            ) : (
              <CarruselFlayers
                flayers={state.carrucelAbm}
                onEliminar={handleElimnarFlayer}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
