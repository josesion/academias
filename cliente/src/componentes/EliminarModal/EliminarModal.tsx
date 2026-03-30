import { Boton } from "../Boton/Boton";
import { CompoError } from "../Error/Error";

import "./eliminarModal.css";

/**
 * @typedef {Object} ComponenteEliminar
 * @template T - El tipo de dato de la entidad que se va a manipular (debe extender de un objeto).
 * @property {T} data - El objeto de datos de la entidad sobre la cual se ejecutará la acción (ej: el alumno a eliminar).
 * @property {function(T): void} [onSi] - Función de callback que se ejecuta al confirmar la acción. Recibe el objeto `data`.
 * @property {function(): void} [onCancelar] - Función de callback que se ejecuta al cancelar y cerrar el modal.
 * @property {string} accion - Una descripción del tipo de acción que se está confirmando (ej: "eliminar el alumno con DNI 123456").
 * @property {string | null} [mensaje] - Mensaje de error opcional a mostrar dentro del modal (proviene típicamente de una API).
 */

type ComponenteEliminar<T extends object> = {
  data: T;
  onSi?: (data: T) => void;
  onCancelar?: () => void;
  accion: string;
  mensaje?: string | null;
  cargando?: boolean; // <-- Nueva Prop
};

/**
 * @function EliminarVentana
 * @template T - El tipo de dato del objeto que se está manipulando.
 * @description Componente genérico que muestra una confirmación de acción con opciones "Sí" y "No".
 * Implementa un `onClick` para el botón "Sí" que ejecuta el handler `onSi` pasando el objeto `data`,
 * y un botón "No" que ejecuta `onCancelar`.
 * @param {ComponenteEliminar<T>} props - Las propiedades que incluyen los datos de la entidad, los handlers y la descripción de la acción.
 * @returns {JSX.Element} La ventana modal de confirmación de eliminación.
 */

export function EliminarVentana<T extends object>({
  data,
  onSi,
  onCancelar,
  accion,
  mensaje,
  cargando, // Por defecto no carga
}: ComponenteEliminar<T>) {
  return (
    <div className={`componente_eliminar ${cargando ? "estado_cargando" : ""}`}>
      {/* SPINNER TECNOLÓGICO */}
      {cargando && (
        <div className="spinner_container_eliminar">
          <div className="spinner_neon_circle"></div>
          <p className="texto_cargando">Procesando...</p>
        </div>
      )}

      <div className="datos_eliminar">
        <p>¿Estás seguro de eliminar ?</p>
        <p>{accion}</p>
      </div>

      <div className="botonera_eliminar">
        <Boton
          texto={cargando ? "Eliminando..." : "Sí"}
          logo={cargando ? null : "Delete"} // Ocultar logo si carga
          size={20}
          clase="eliminar"
          onClick={() => onSi && data && onSi(data)}
          focus={!cargando}
          disable={cargando} // Desactivar si carga
        />

        <Boton
          texto="No"
          logo="Cancel"
          size={20}
          clase="editar"
          onClick={onCancelar}
          disable={cargando} // No dejar cancelar si ya está borrando
        />
      </div>

      {mensaje && <CompoError mensaje={mensaje} />}
    </div>
  );
}
