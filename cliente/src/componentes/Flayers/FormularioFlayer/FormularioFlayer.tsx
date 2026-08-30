import "./formularioflayer.css";
import { Boton } from "../../generales/Boton/Boton";
import { Inputs } from "../../generales/Inputs/Inputs";

export interface ErroresDetalle {
  imagen: string | null;
  titulo: string | null;
  descripcion: string | null;
}

export interface Valores {
  flayer_titulo: string;
  descripcion_titulo: string;
}

export interface PropsFormularioFlayer {
  valores: Valores;
  detallesErrores: ErroresDetalle;
  onChangeTitulo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const FormularioFlayer = (props: PropsFormularioFlayer) => {
  return (
    // 1. Cambiamos el div contenedor por un <form> y agregamos el onSubmit
    <form onSubmit={props.onSubmit} className="formulario_flayer_contenedor">
      <div className="formulario_flayer_campo">
        <Inputs
          placeholder="Titulo"
          type="text"
          name="flayer_titulo"
          error={props.detallesErrores.titulo}
          label="Titulo"
          onChange={props.onChangeTitulo}
          value={props.valores.flayer_titulo}
          readonly={false}
        />
      </div>

      <div className="formulario_flayer_campo">
        <Inputs
          placeholder="Descripcion"
          type="text"
          name="descripcion_titulo"
          error={props.detallesErrores.descripcion}
          label="Descripcion Flayer"
          onChange={props.onChangeTitulo}
          value={props.valores.descripcion_titulo}
          readonly={false}
        />
      </div>

      <div className="formulario_flayer_acciones">
        {/* 2. Aseguramos que el botón sea type="submit" */}
        <Boton clase="agregar" logo="Add" texto="Subir Flayer" type="submit" />
      </div>
    </form>
  );
};
