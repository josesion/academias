import "./spinnerTarjetas.css";

interface SpinnerTarjetaProps {
  /** Texto que acompaña al spinner. Por defecto: "Cargando métricas...". */
  texto?: string;
  /** Etiqueta accesible opcional (la usan algunos call sites existentes). */
  "aria-label"?: string;
  /** Permite ocultar el spinner a lectores de pantalla (compatibilidad). */
  "aria-hidden"?: boolean | "true" | "false";
}

/**
 * Spinner de carga para una tarjeta o bloque.
 *
 * Es el indicador local que usan las pantallas de la sección Alumno: vive
 * dentro del bloque que está cargando y nunca tapa la página.
 *
 * @param props.texto - Texto que se muestra debajo del spinner.
 * @returns El bloque con el spinner girando.
 */
export const SpinnerTarjeta = ({
  texto = "Cargando métricas...",
}: SpinnerTarjetaProps) => {
  return (
    <div className="spinner_tarjeta">
      <div className="spinner_tarjeta_loader"></div>
      <div className="spinner_tarjeta_texto">{texto}</div>
    </div>
  );
};
