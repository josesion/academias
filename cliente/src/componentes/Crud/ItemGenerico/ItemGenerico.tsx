import "./itemGenerico.css";

type ItemGenericoProps<T extends object> = {
  textoBoton: string;
  data: T;
  onEditarButton?: (data: T) => void;
  onEliminarButton?: (data: T) => void;
};

export function ItemGenerico<T extends object>({
  data,
  onEditarButton,
  onEliminarButton,
  textoBoton,
}: ItemGenericoProps<T>) {
  const entries = data ? (Object.entries(data) as [string, any][]) : [];

  // Buscamos si hay un ID o código para mostrarlo arriba de todo
  const idEntry = entries.find(
    ([key]) =>
      key.toLowerCase().includes("id") || key.toLowerCase().includes("codigo"),
  );

  // Resto de los campos (ej: mes, cantidad_clases, monto, nombre, etc.)
  const otherEntries = entries.filter(
    ([key]) =>
      !key.toLowerCase().includes("id") &&
      !key.toLowerCase().includes("codigo"),
  );

  // Helpers para identificar claves específicas y darles contexto visual si querés
  const formatLabel = (key: string) => {
    const lower = key.toLowerCase();
    if (lower.includes("clase")) return "Clases";
    if (lower.includes("mes")) return "Mes";
    if (
      lower.includes("monto") ||
      lower.includes("precio") ||
      lower.includes("total")
    )
      return "Monto";
    return key.replace(/_/g, " ");
  };

  // Texto que identifica al item dentro del listado. Se usa en los
  // `aria-label` de los botones: sin esto el lector de voz anuncia solo
  // "EDITAR" / "DAR DE BAJA" sin decir sobre QUE fila (WCAG 2.4.6).
  const identificador = idEntry ? `#${idEntry[1]}` : "";

  return (
    <div className="item_card_editorial">
      {/* Indicador superior derecho estilo etiqueta */}
      <div className="item_indicador_punto" aria-hidden="true" />

      <div className="item_card_body">
        {/* Identificador / ID superior (Ej: #0842) */}
        {idEntry && <span className="item_id_editorial">#{idEntry[1]}</span>}

        {/* Contenido dinámico con etiquetas claras */}
        <div className="item_contenido_principal">
          {otherEntries.map(([key, value], index) => {
            const displayValue =
              value === null || value === undefined ? "-" : String(value);
            const esPrincipal = index === 0; // El primer campo sigue manteniendo protagonismo visual grande

            return (
              <div
                key={key}
                className={
                  esPrincipal ? "item_bloque_principal" : "item_bloque_detalle"
                }
              >
                <span className="item_label_editorial">{formatLabel(key)}</span>
                <span
                  className={
                    esPrincipal ? "item_valor_titulo" : "item_valor_sub"
                  }
                >
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Acciones minimalistas abajo */}
      <div className="item_card_actions">
        <button
          type="button"
          className="item_link_editar"
          onClick={() => onEditarButton && data && onEditarButton(data)}
          aria-label={identificador ? `Editar ${identificador}` : "Editar"}
        >
          <span aria-hidden="true">✏️</span> EDITAR
        </button>

        {onEliminarButton && (
          <button
            type="button"
            className="item_link_eliminar"
            onClick={() => onEliminarButton && data && onEliminarButton(data)}
            aria-label={
              identificador
                ? `${textoBoton} ${identificador}`
                : textoBoton
            }
          >
            {textoBoton.toUpperCase()}
          </button>
        )}
      </div>
    </div>
  );
}
