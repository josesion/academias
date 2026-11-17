import { Fragment } from "react";
import { GuiaSeccion } from "../GuiaSeccion";

/**
 * Guía paso a paso: Ajustes.
 *
 * Explica cómo configurar niveles, géneros musicales, categorías y tipos de cuenta.
 */
export const GuiaAjustesPage = () => {
  const pasos = [
    {
      numero: 1,
      titulo: "Acceder a la sección de Ajustes",
      descripcion: (
        <Fragment>
          <p>
            Desde el menú lateral, ve a <strong>"Ajustes"</strong>. Aquí encontrarás las configuraciones
            base que definen cómo funciona tu academia. Esta sección tiene cuatro partes:
          </p>
          <div className="guia-desc-columnas">
            <div className="guia-desc-columna">
              <p className="guia-desc-columna-titulo">
                📚 Niveles
              </p>
              <p>Son los niveles de habilidad de tus alumnos.</p>
              <ul>
                <li><strong>Baile:</strong> "Principiante", "Intermedio", "Avanzado"</li>
                <li><strong>Gym:</strong> "Básico", "Intermedio", "Experto"</li>
              </ul>
              <p style={{ marginTop: "0.4rem" }}>
                Se usan en los <strong>horarios</strong> y <strong>asistencias</strong>.
              </p>
            </div>
            <div className="guia-desc-columna">
              <p className="guia-desc-columna-titulo">
                🎵 Géneros o Tipos
              </p>
              <p>Los estilos o tipos de clase que ofrecés.</p>
              <ul>
                <li><strong>Baile:</strong> "Salsa", "Bachata", "Tango", "Kizomba"</li>
                <li><strong>Gym:</strong> "CrossFit", "Yoga", "Spinning", "Musculación"</li>
              </ul>
              <p style={{ marginTop: "0.4rem" }}>
                Se usan en los <strong>horarios</strong> y <strong>asistencias</strong>.
              </p>
            </div>
            <div className="guia-desc-columna">
              <p className="guia-desc-columna-titulo">
                📂 Categorías de Cajas
                <span className="guia-desc-badge">Intermedio</span>
              </p>
              <p>Categorías para ingresos y egresos extraordinarios.</p>
              <ul>
                <li><strong>Ingreso:</strong> "Venta de camisetas", "Evento especial"</li>
                <li><strong>Egreso:</strong> "Pago de limpieza", "Mantenimiento"</li>
              </ul>
              <p style={{ marginTop: "0.4rem" }}>
                Se usan al registrar <strong>movimientos manuales</strong> en la caja.
              </p>
            </div>
            <div className="guia-desc-columna">
              <p className="guia-desc-columna-titulo">
                💳 Tipos de Cuentas
                <span className="guia-desc-badge">Intermedio</span>
              </p>
              <p>Los métodos de pago que aceptás.</p>
              <ul>
                <li>"Efectivo", "Tarjeta de débito", "Transferencia", "Mercado Pago"</li>
              </ul>
              <p style={{ marginTop: "0.4rem" }}>
                Se usan en <strong>inscripciones</strong> y <strong>caja</strong>.
              </p>
            </div>
          </div>
          <p className="guia-desc-nota">
            💡 Nota: Algunos tipos de cuenta vienen creados por defecto al registrar una academia nueva
            (como "Efectivo" y "Transferencia"). No es necesario crearlos si ya los ves en el listado.
          </p>
        </Fragment>
      ),
      imagen: "ajustes-menu-seccion",
      nota: "Captura: Sección 'Ajustes' del menú lateral desplegada mostrando las 4 opciones.",
    },
    {
      numero: 2,
      titulo: "Gestionar Niveles",
      descripcion:
        'Ve a "Ajustes" → "Niveles". Aquí administras los niveles de clase: puedes dar de alta un nivel nuevo, modificar el nombre de uno existente o dar de baja los que ya no uses. Por ejemplo, en una academia de baile podrías tener "Principiante", "Intermedio", "Avanzado". En una academia de gym: "Básico", "Intermedio", "Experto".',
      imagen: "ajustes-niveles-listado",
      nota: "Captura: Listado de niveles con botones de acción.",
    },
    {
      numero: 3,
      titulo: "Dar de alta o dar de baja un nivel",
      descripcion:
        'Para dar de alta un nivel nuevo, presiona el botón "Agregar", ingresa el nombre (por ejemplo, "Principiante" en baile o "Clase 1" en gym) y confirma. Para dar de baja un nivel que ya no uses, haz clic en el botón de eliminar y confirma en el modal. Esto no lo borra del sistema, solo lo marca como inactivo.',
      imagen: "ajustes-niveles-alta-y-baja",
      nota: "Captura: Modal de alta de nivel y modal de confirmación de baja.",
    },
    {
      numero: 4,
      titulo: "Gestionar Géneros Musicales o Tipos de Entrenamiento",
      descripcion:
        'Ve a "Ajustes" → "Géneros Musicales". En academias de baile, aquí administras los estilos de baile: puedes dar de alta géneros como "Salsa", "Bachata", "Tango", "Kizomba", "Cumbia". En academias de gym, administras los tipos de entrenamiento: "CrossFit", "Yoga", "Spinning", "Musculación". Puedes modificar nombres o dar de baja los que ya no uses.',
      imagen: "ajustes-tipos-listado",
      nota: "Captura: Listado de géneros musicales o tipos de entrenamiento.",
    },
    {
      numero: 5,
      titulo: "Dar de alta o dar de baja un género o tipo",
      descripcion:
        'Para dar de alta un género o tipo nuevo, presiona el botón "Agregar", ingresa el nombre (por ejemplo, "Salsa" en baile o "Zumba" en gym) y confirma. Para dar de baja uno que ya no uses, haz clic en el botón de eliminar y confirma en el modal. Esto no lo borra del sistema, solo lo marca como inactivo.',
      imagen: "ajustes-tipos-alta-y-baja",
      nota: "Captura: Modal de alta de género/tipo y modal de confirmación de baja.",
    },
    {
      numero: 6,
      titulo: "Gestionar Categorías de Cajas",
      descripcion: (
        <Fragment>
          <p>
            Ve a <strong>"Ajustes"</strong> → <strong>"Categorías de Cajas"</strong> (solo plan Intermedio).
            Aquí creás las categorías para organizar el dinero que entra o sale de tu academia <strong>más allá de las inscripciones normales</strong>.
          </p>
          <p>
            Piensalo así: cada vez que recibís o pagás algo que <strong>no es una inscripción</strong>, necesitás una categoría para registrarlo.
          </p>
          <div className="guia-desc-columnas">
            <div className="guia-desc-columna">
              <p className="guia-desc-columna-titulo">
                ➕ Ingresos extraordinarios
              </p>
              <p>Dinero que entra y no es de inscripción:</p>
              <ul>
                <li><strong>"Venta de camisetas"</strong> — si vendés indumentaria de la escuela.</li>
                <li><strong>"Evento especial"</strong> — si hacés un show o competencia y cobrás entrada.</li>
                <li><strong>"Multas"</strong> — si cobrás penalizaciones por inasistencia o retraso.</li>
                <li><strong>"Donación"</strong> — si alguien te hace un aporte voluntario.</li>
              </ul>
            </div>
            <div className="guia-desc-columna">
              <p className="guia-desc-columna-titulo">
                ➖ Egresos extraordinarios
              </p>
              <p>Dinero que sale de la academia:</p>
              <ul>
                <li><strong>"Pago de limpieza"</strong> — si contratas a alguien para limpiar.</li>
                <li><strong>"Mantenimiento"</strong> — reparaciones de equipos o instalaciones.</li>
                <li><strong>"Pago de luz"</strong> — servicios públicos del local.</li>
                <li><strong>"Compra de materiales"</strong> — sábanas, toallas, productos de limpieza.</li>
              </ul>
            </div>
          </div>
          <p>
            Cuando abrís la caja y presionás <strong>"+ Ingreso"</strong> o <strong>"- Egreso"</strong>, el sistema te pedirá elegir una de estas categorías para saber cómo clasificar el movimiento.
          </p>
          <p className="guia-desc-nota">
            💡 Si no creás categorías, no podrás registrar ingresos ni egresos extraordinarios en la caja. Creá al menos una de cada tipo antes de empezar a usar la caja.
          </p>
        </Fragment>
      ),
      imagen: "ajustes-categorias-caja-listado",
      nota: "Captura: Listado de categorías de caja con tipo ingreso/egreso.",
    },
    {
      numero: 7,
      titulo: "Dar de alta o dar de baja una categoría de caja",
      descripcion:
        'Para dar de alta una categoría nueva, presiona el botón "Agregar", ingresa el nombre (por ejemplo, "Venta de camisetas" como ingreso o "Pago de limpieza" como egreso) y selecciona si es ingreso o egreso. Para dar de baja una categoría que ya no uses, haz clic en el botón de eliminar y confirma en el modal. Esto no la borra del sistema, solo la marca como inactiva.',
      imagen: "ajustes-categorias-caja-alta-y-baja",
      nota: "Captura: Modal de alta de categoría con selector de tipo y modal de confirmación de baja.",
    },
    {
      numero: 8,
      titulo: "Gestionar Tipos de Cuentas",
      descripcion: (
        <Fragment>
          <p>
            Ve a <strong>"Ajustes"</strong> → <strong>"Tipos de Cuentas"</strong> (solo plan Intermedio).
            Aquí defines los métodos de pago disponibles: se usan tanto en inscripciones como en movimientos de caja.
          </p>
          <p className="guia-desc-nota">
            💡 Nota: Algunos métodos de pago vienen creados por defecto como <strong>"Efectivo"</strong> y <strong>"Transferencia"</strong>. No necesitas crearlos si ya los ves en el listado.
          </p>
        </Fragment>
      ),
      imagen: "ajustes-tipos-cuenta-listado",
      nota: "Captura: Listado de tipos de cuenta/métodos de pago.",
    },
    {
      numero: 9,
      titulo: "Dar de alta o dar de baja un tipo de cuenta",
      descripcion:
        'Para dar de alta un método de pago nuevo, presiona el botón "Agregar", ingresa el nombre (por ejemplo, "Efectivo", "Tarjeta de débito", "Transferencia bancaria", "Mercado Pago") y confirma. Para dar de baja un método que ya no uses, haz clic en el botón de eliminar y confirma en el modal. Esto no lo borra del sistema, solo lo marca como inactivo.',
      imagen: "ajustes-tipos-cuenta-alta-y-baja",
      nota: "Captura: Modal de alta de tipo de cuenta y modal de confirmación de baja.",
    },
  ];

  return (
    <GuiaSeccion
      titulo="Ajustes"
      subtitulo="Configura niveles, géneros, categorías y tipos de cuenta."
      carpetaImagenes="ajustes"
      pasos={pasos}
    />
  );
};
