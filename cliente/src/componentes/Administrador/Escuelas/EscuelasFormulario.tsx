import "./formularioescuela.css";

import { Boton } from "../../generales/Boton/Boton";
import { Inputs } from "../../generales/Inputs/Inputs";
import { CompoError } from "../../generales/Error/Error";

import { type CeldasInput } from "../../../reducers/escuelas.reducer";

// Este es el tipo exacto solo para la propiedad "formulario"
export interface FormularioEscuelaTipado {
  dni_propietario: CeldasInput;
  nombre_propietario: CeldasInput;
  apellido_propietario: CeldasInput;
  razon_social: CeldasInput;
  direccion: CeldasInput;
  celular: CeldasInput;
}

interface ImagenFormularioTipado {
  imagen: File | null;
  urlVistaPrevia: string | null;
  modificado?: boolean | null;
}

interface PropsFormEscuelas {
  postEscuelas: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  putEscuelas: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  cambioImagen: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCerrar: () => void;
  cachearFormulario: (event: React.ChangeEvent<HTMLInputElement>) => void;
  metodo: "POST" | "PUT" | null;
  formulario: FormularioEscuelaTipado;
  imagen: ImagenFormularioTipado;
  error: string | null;
  carga: boolean;
}

export const FormularioEscuelas = (data: PropsFormEscuelas) => {
  const {
    error,
    carga,
    formulario,
    metodo,
    postEscuelas,
    putEscuelas,
    onCerrar,
    imagen,
    cambioImagen,
    cachearFormulario,
  } = data;

  const { urlVistaPrevia } = imagen;

  return (
    <form action="" className="form-escuela">
      <header className="form-escuela__encabezado">
        <h2 className="form-escuela__titulo">Datos de la Academia</h2>
        <p className="form-escuela__subtitulo">
          Completá la información del propietario y de la academia.
        </p>
      </header>

      <div className="form-escuela__grupo form-escuela__grupo--datos">
        <Inputs
          type="number"
          placeholder="Dni del propietario"
          label="Dni Cliente"
          name={formulario.dni_propietario.name}
          value={formulario.dni_propietario.value}
          readonly={false}
          onChange={cachearFormulario}
        />{" "}
        <Inputs
          type="text"
          placeholder="Nombre Academia"
          label="Razon Social"
          name={formulario.razon_social.name}
          value={formulario.razon_social.value}
          readonly={false}
          onChange={cachearFormulario}
        />
        <Inputs
          type="text"
          placeholder="Apellido"
          label="Apellido"
          name={formulario.apellido_propietario.name}
          value={formulario.apellido_propietario.value}
          readonly={false}
          onChange={cachearFormulario}
        />
        <Inputs
          type="text"
          placeholder="Nombre"
          label="Nombre"
          name={formulario.nombre_propietario.name}
          value={formulario.nombre_propietario.value}
          readonly={false}
          onChange={cachearFormulario}
        />
        <Inputs
          type="text"
          placeholder="Direccion"
          label="Direccion Academia"
          name={formulario.direccion.name}
          value={formulario.direccion.value}
          readonly={false}
          onChange={cachearFormulario}
        />
        <Inputs
          type="number"
          placeholder="Numero Celular"
          label="Celular"
          name={formulario.celular.name}
          value={formulario.celular.value}
          readonly={false}
          onChange={cachearFormulario}
        />
      </div>

      <div className="form-escuela__grupo form-escuela__grupo--logo">
        <div className="form-escuela__logo-input">
          <Inputs
            type="file"
            placeholder="Logo"
            label="Logo Academia"
            name="imagen"
            onChange={cambioImagen}
            readonly={false}
          />
        </div>

        <figure className="form-escuela__logo-panel" aria-live="polite">
          <div className="form-escuela__logo-marco">
            {urlVistaPrevia ? (
              <img
                src={urlVistaPrevia}
                alt="Vista previa del logo de la academia"
                className="form-escuela__logo-img"
              />
            ) : (
              <span className="form-escuela__logo-vacio">Logo</span>
            )}
          </div>
          <figcaption className="form-escuela__logo-leyenda">
            {urlVistaPrevia ? "Vista previa" : "Sin logo"}
          </figcaption>
        </figure>
      </div>

      <div className="form-escuela__acciones">
        <Boton
          disable={carga}
          clase="agregar"
          logo="Add"
          type="button" // 👈 Lo dejamos como botón común
          texto={metodo === "PUT" ? "Actualizar" : "Guardar"}
          onClick={
            metodo === "POST"
              ? postEscuelas
              : metodo === "PUT"
                ? putEscuelas
                : undefined
          }
        />
        <Boton
          clase="cancelar"
          logo="Cancel"
          type="button"
          texto="Cancelar"
          onClick={onCerrar}
        />
      </div>

      {error && <CompoError mensaje={error} />}
    </form>
  );
};
