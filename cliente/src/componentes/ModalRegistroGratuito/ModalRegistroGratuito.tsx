import { useEffect, useId, useMemo, useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useModalAccesible } from "../../hooks/useModalAccesible";
import { useDisponibilidadUsuario } from "../../hooks/registro.gratuito/useDisponibilidadUsuario";
import { useRegistroGratuito } from "../../hooks/registro.gratuito/useRegistroGratuito";
import { CartelExitoRegistro } from "../CartelExitoRegistro/CartelExitoRegistro";
import { PhoneInputField } from "../generales/PhoneInputField/PhoneInputField";
import "./ModalRegistroGratuito.css";

interface ModalRegistroGratuitoProps {
  abierto: boolean;
  onCerrar: () => void;
}

interface FormularioRegistro {
  razon_social: string;
  direccion: string;
  celular: string | undefined;
  correo: string;
  rubro: "" | "baile" | "gym";
  dni_propietario: string;
  nombre_propietario: string;
  apellido_propietario: string;
  usuario: string;
  descripcion: string;
}

const estadoInicial: FormularioRegistro = {
  razon_social: "",
  direccion: "",
  celular: undefined,
  correo: "",
  rubro: "",
  dni_propietario: "",
  nombre_propietario: "",
  apellido_propietario: "",
  usuario: "",
  descripcion: "",
};

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  etiqueta: string;
  completo?: boolean;
  children?: ReactNode;
}

const Campo = ({
  id,
  etiqueta,
  completo,
  children,
  ...inputProps
}: CampoProps) => (
  <div
    className={`modal-registro-campo${completo ? " modal-registro-campo--completo" : ""}`}
  >
    <label htmlFor={id}>{etiqueta}</label>
    <input id={id} required {...inputProps} />
    {children}
  </div>
);

export const ModalRegistroGratuito = ({
  abierto,
  onCerrar,
}: ModalRegistroGratuitoProps) => {
  const [form, setForm] = useState<FormularioRegistro>(estadoInicial);
  const [errorLocal, setErrorLocal] = useState("");
  const [mostrarExito, setMostrarExito] = useState(false);
  const { refDialog } = useModalAccesible({ abierto, onCerrar });
  const { estado: estadoUsuario, mensaje: mensajeUsuario } =
    useDisponibilidadUsuario(form.usuario);
  const { registrar, cargando, error } = useRegistroGratuito();

  const base = useId();
  const id = (campo: string) => `${base}-${campo}`;

  useEffect(() => {
    if (!abierto) {
      setForm(estadoInicial);
      setErrorLocal("");
    }
  }, [abierto]);

  const puedeEnviar = useMemo(() => {
    if (cargando) return false;
    if (estadoUsuario === "no_disponible" || estadoUsuario === "verificando")
      return false;
    return (
      !!form.razon_social.trim() &&
      !!form.direccion.trim() &&
      !!form.celular &&
      !!form.correo.trim() &&
      !!form.rubro &&
      !!form.dni_propietario.trim() &&
      !!form.nombre_propietario.trim() &&
      !!form.apellido_propietario.trim() &&
      !!form.usuario.trim()
    );
  }, [cargando, estadoUsuario, form]);

  const onChange =
    (campo: keyof FormularioRegistro) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [campo]: e.target.value }));
      setErrorLocal("");
    };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!puedeEnviar) return;
    setErrorLocal("");

    // Acepta "30.123.456" y lo reduce a dígitos
    const dniLimpio = form.dni_propietario.replace(/\D/g, "");
    if (!/^\d{7,8}$/.test(dniLimpio)) {
      setErrorLocal("El DNI debe tener 7 u 8 dígitos");
      return;
    }

    const res = await registrar({
      razon_social: form.razon_social.trim(),
      direccion: form.direccion.trim(),
      celular: form.celular || "",
      correo: form.correo.trim(),
      rubro: form.rubro as "baile" | "gym",
      dni_propietario: Number(dniLimpio),
      nombre_propietario: form.nombre_propietario.trim(),
      apellido_propietario: form.apellido_propietario.trim(),
      usuario: form.usuario.trim(),
      descripcion: form.descripcion.trim() || undefined,
    });
    if (res.ok) {
      setMostrarExito(true);
      onCerrar();
    }
  };

  // El cartel de éxito tiene que seguir montado aunque el modal ya se cerró
  if (!abierto && !mostrarExito) return null;

  const mensajeError = errorLocal || error;

  return createPortal(
    <>
      {abierto && (
        <div className="modal-registro-overlay">
          <div
            ref={refDialog}
            className="modal-registro-tarjeta"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-registro-gratuito"
            aria-describedby="descripcion-registro-gratuito"
          >
            <button
              type="button"
              className="modal-registro-cerrar"
              onClick={onCerrar}
              aria-label="Cerrar"
            >
              <svg
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </button>

            <header className="modal-registro-header">
              <p className="modal-registro-eyebrow">Plan gratuito · 30 días</p>
              <h2 id="titulo-registro-gratuito">
                Crear cuenta con plan gratuito
              </h2>
              <p
                id="descripcion-registro-gratuito"
                className="modal-registro-descripcion"
              >
                Acceso completo al Plan Intermedio durante 30 días.
              </p>
            </header>

            <form
              className="modal-registro-form"
              onSubmit={onSubmit}
              aria-busy={cargando}
            >
              <p className="modal-registro-requeridos">
                Todos los campos son obligatorios.
              </p>

              <fieldset className="modal-registro-grupo">
                <legend>Tu academia o gym</legend>
                <div className="modal-registro-grid">
                  <Campo
                    id={id("razon")}
                    etiqueta="Razón social / Nombre de la academia o gym"
                    completo
                    value={form.razon_social}
                    onChange={onChange("razon_social")}
                    autoComplete="organization"
                  />
                  <Campo
                    id={id("direccion")}
                    etiqueta="Dirección"
                    value={form.direccion}
                    onChange={onChange("direccion")}
                    autoComplete="street-address"
                  />
                  <div className="modal-registro-campo modal-registro-campo--textarea">
                    <label htmlFor={id("descripcion")}>Descripción de tu academia o gym</label>
                    <textarea
                      id={id("descripcion")}
                      value={form.descripcion}
                      onChange={onChange("descripcion")}
                      rows={3}
                      placeholder="Breve descripción de tu academia o gym"
                      autoComplete="off"
                    />
                  </div>
                  <div className="modal-registro-campo">
                    <label htmlFor={id("rubro")}>Rubro</label>
                    <select
                      id={id("rubro")}
                      value={form.rubro}
                      onChange={onChange("rubro")}
                      required
                    >
                      <option value="">Seleccionar</option>
                      <option value="baile">Baile</option>
                      <option value="gym">Gym</option>
                    </select>
                  </div>
                  <div className="modal-registro-campo">
                    <PhoneInputField
                      label="Celular"
                      value={form.celular}
                      onChange={(val) => {
                        setForm((prev) => ({ ...prev, celular: val }));
                        setErrorLocal("");
                      }}
                      required
                    />
                    <small className="modal-registro-hint">
                      Este celular será usado para promocionar tu academia.
                    </small>
                  </div>
                  <Campo
                    id={id("correo")}
                    etiqueta="Correo de la cuenta / propietario"
                    type="email"
                    value={form.correo}
                    onChange={onChange("correo")}
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                </div>
              </fieldset>

              <fieldset className="modal-registro-grupo">
                <legend>Datos del propietario</legend>
                <div className="modal-registro-grid">
                  <Campo
                    id={id("nombre")}
                    etiqueta="Nombre"
                    value={form.nombre_propietario}
                    onChange={onChange("nombre_propietario")}
                    autoComplete="given-name"
                  />
                  <Campo
                    id={id("apellido")}
                    etiqueta="Apellido"
                    value={form.apellido_propietario}
                    onChange={onChange("apellido_propietario")}
                    autoComplete="family-name"
                  />
                  <Campo
                    id={id("dni")}
                    etiqueta="DNI"
                    inputMode="numeric"
                    value={form.dni_propietario}
                    onChange={onChange("dni_propietario")}
                    autoComplete="off"
                  />
                </div>
              </fieldset>

              <fieldset className="modal-registro-grupo">
                <legend>Acceso</legend>
                <div className="modal-registro-grid">
                  <Campo
                    id={id("usuario")}
                    etiqueta="Nombre de usuario (para ingresar)"
                    completo
                    value={form.usuario}
                    onChange={onChange("usuario")}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={estadoUsuario === "no_disponible"}
                    aria-describedby={id("usuario-estado")}
                  >
                    {/* Siempre en el DOM: así el lector de pantalla anuncia los cambios */}
                    <small
                      id={id("usuario-estado")}
                      className="modal-registro-estado"
                      data-estado={estadoUsuario}
                      aria-live="polite"
                    >
                      {estadoUsuario === "verificando" && (
                        <span className="spinner_mini" aria-hidden="true" />
                      )}
                      {mensajeUsuario}
                    </small>
                  </Campo>
                </div>
              </fieldset>

              {mensajeError && (
                <div className="modal-registro-error" role="alert">
                  {mensajeError}
                </div>
              )}

              <div className="modal-registro-acciones">
                <button
                  className="btn-principal modal-registro-enviar"
                  type="submit"
                  disabled={!puedeEnviar}
                >
                  {cargando && (
                    <span className="spinner_mini" aria-hidden="true" />
                  )}
                  {cargando ? "Creando cuenta..." : "Crear cuenta gratuita"}
                </button>
                <p className="modal-registro-nota">
                  No se pide contraseña: se genera una de 8 dígitos y se envía
                  por correo.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
      <CartelExitoRegistro abierto={mostrarExito} />
    </>,
    document.body,
  );
};
