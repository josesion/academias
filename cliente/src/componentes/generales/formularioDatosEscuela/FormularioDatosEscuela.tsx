import { useState, useEffect } from "react";
import { Inputs } from "../Inputs/Inputs";
import { PhoneInputField } from "../PhoneInputField/PhoneInputField";
import { Boton } from "../Boton/Boton";
import { useAbmDatosEscuela } from "../../../hookNegocios/abmDatosEscuela";
import "./formularioDatosEscuela.css";

/**
 * Formulario para editar los datos de la escuela del usuario logueado (spec 051).
 * Solo visible para rol `usuario` (no para `alumno`).
 *
 * Usa las mismas clases que `FormularioInfoUsuario` (`perfil_seccion`,
 * `section-title`, `perfil_grupo`) para mantener un estilo unificado en el
 * perfil del usuario.
 */
export const FormularioDatosEscuela = () => {
  const { datos, cargando, guardando, guardar } =
    useAbmDatosEscuela();

  const [razonSocial, setRazonSocial] = useState("");
  const [direccion, setDireccion] = useState("");
  const [celular, setCelular] = useState<string | undefined>(undefined);
  const [descripcion, setDescripcion] = useState("");

  // Sincronizar el estado local con los datos cargados
  useEffect(() => {
    if (datos) {
      setRazonSocial(datos.razon_social);
      setDireccion(datos.direccion || "");
      setCelular(datos.celular || undefined);
      setDescripcion(datos.descripcion || "");
    }
  }, [datos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputs = {
      razon_social: razonSocial.trim() || undefined,
      direccion: direccion.trim() || undefined,
      celular: celular || undefined,
      descripcion: descripcion.trim() || undefined,
    };
    await guardar(inputs);
  };

  // Cargando datos iniciales
  if (cargando) {
    return (
      <section className="perfil_seccion" aria-busy="true">
        <h2 className="section-title">Datos de mi escuela</h2>
        <div className="datos-escuela__carga" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true" />
          <span className="visually-hidden">
            Cargando datos de la escuela...
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="perfil_seccion">
      <h2 className="section-title">Datos de mi escuela</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="perfil_grupo">
          <Inputs
            label="Razón social"
            name="razon_social"
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            readonly={false}
            autoComplete="organization"
          />
        </div>

        <div className="perfil_grupo">
          <Inputs
            label="Dirección"
            name="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            readonly={false}
            autoComplete="street-address"
          />
        </div>

        <div className="perfil_grupo">
          <PhoneInputField
            label="Celular"
            value={celular}
            onChange={(val) => setCelular(val)}
            defaultCountry="AR"
          />
          {!guardando && (
            <span className="perfil_ayuda">
              Opcional
            </span>
          )}
        </div>

        <div className="perfil_grupo">
          <label className="datos-escuela__label" htmlFor="escuela_descripcion">
            Descripción
          </label>
          <textarea
            id="escuela_descripcion"
            className="inputs"
            name="escuela_descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder="Breve descripción de tu academia o gym"
          />
        </div>

        <div className="perfil_acciones">
          <Boton
            texto={guardando ? "Guardando..." : "Guardar cambios"}
            logo="Check"
            size={25}
            clase="aceptar"
            type="button"
            disable={guardando}
            onClick={handleSubmit}
          />
        </div>
      </form>
    </section>
  );
};
