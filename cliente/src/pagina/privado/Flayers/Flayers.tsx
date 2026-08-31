import { confiFlayer } from "../../../hookNegocios/flayers";

import { LienzoImagen } from "../../../componentes/Flayers/ImagenSector/ImagenSector";
import { FormularioFlayer } from "../../../componentes/Flayers/FormularioFlayer/FormularioFlayer";
import { CompoError } from "../../../componentes/generales/Error/Error";
import { ModalConfirmacion } from "../../../componentes/Flayers/Confirmacion/Confirmacion";
import { CarruselFlayers } from "../../../componentes/Flayers/Carrucel/CarruselFlayers";

import "./flayer.css";

export const FlayersPag = () => {
  const {
    state,
    cachearFormulario,
    cachearImagen,
    quitarImagen,
    handleSubmit,
    handleCerrarModal,
  } = confiFlayer();

  return (
    <section className="flayers_pagina">
      {/* MODAL */}
      <ModalConfirmacion
        abierto={state.modalConfirmacion}
        onCerrar={handleCerrarModal}
      />

      {/* CONTENIDO PRINCIPAL */}
      <div className="flayers_pagina_contenido">
        {/* 👇 NUEVO CONTENEDOR PARA LIENZO + FORMULARIO */}
        <div className="flayers_seccion_creacion">
          <div className="flayers_creacion_header">
            <h3 className="flayers_creacion_titulo">Gestión de Flyers</h3>
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
                carga={state.carga}
              />
            </div>
          </div>
        </div>

        {/* GALERÍA / CARRUSEL */}
        <div className="flayers_pagina_galeria">
          <div className="flayers_galeria_header">
            <h3 className="flayers_creacion_titulo">Galería de flyers</h3>
            <p className="flayers_creacion_subtitulo">
              Flyers publicados recientemente
            </p>
          </div>

          <div className="carrusel_flayers_contenendor">
            <CarruselFlayers />
          </div>
        </div>
      </div>

      {/* ERROR */}
      {state.errorGenericos && (
        <div className="flayers_pagina_error">
          <CompoError mensaje={state.errorGenericos} />
        </div>
      )}
    </section>
  );
};
