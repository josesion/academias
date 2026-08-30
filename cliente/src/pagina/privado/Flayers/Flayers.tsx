import { confiFlayer } from "../../../hookNegocios/flayers";

import { LienzoImagen } from "../../../componentes/Flayers/ImagenSector/ImagenSector";
import { FormularioFlayer } from "../../../componentes/Flayers/FormularioFlayer/FormularioFlayer";

import "./flayer.css";

export const FlayersPag = () => {
  const {
    state,
    cachearFormulario,
    cachearImagen,
    quitarImagen,
    handleSubmit,
  } = confiFlayer();

  return (
    <section className="flayers_pagina">
      <div className="flayers_pagina_header">
        <h2 className="flayers_titulo">Gestión de Contenido</h2>
        <p className="flayers_subtitulo">
          Sube y previsualiza los materiales promocionales de la academia.
        </p>
      </div>

      <div className="flayers_pagina_lienzo">
        <LienzoImagen
          onChangeImagen={cachearImagen}
          imagen={state.imagen}
          quitarImagen={quitarImagen}
        />
      </div>

      <div className="flayers_pagina_formulario">
        <FormularioFlayer
          detallesErrores={state.errorDetalles}
          onChangeTitulo={cachearFormulario}
          valores={state.valoresFormulario}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  );
};
