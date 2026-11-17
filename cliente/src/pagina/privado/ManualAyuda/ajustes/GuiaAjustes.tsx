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
      descripcion:
        'Desde el menú lateral, ve a "Ajustes". Aquí encontrarás las configuraciones base del sistema: Niveles, Géneros Musicales (o tipos de entrenamiento), Categorías de Cajas y Tipos de Cuentas.',
      imagen: "ajustes-menu-seccion",
      nota: "Captura: Sección 'Ajustes' del menú lateral desplegada.",
    },
    {
      numero: 2,
      titulo: "Gestionar Niveles",
      descripcion:
        'Ve a "Ajustes" → "Niveles". Aquí administras los niveles de clase (ej: Principiante, Intermedio, Avanzado). Puedes dar de alta, modificar y eliminar niveles con el mismo patrón CRUD que otras secciones.',
      imagen: "ajustes-niveles-listado",
      nota: "Captura: Listado de niveles con botones de acción.",
    },
    {
      numero: 3,
      titulo: "Crear un nuevo nivel",
      descripcion:
        'Presiona el botón "Agregar" para abrir el formulario modal. Ingresa el nombre del nivel (ej: "Principiante") y confirma. Este nivel estará disponible en los horarios y asistencias.',
      imagen: "ajustes-niveles-alta",
      nota: "Captura: Modal de alta de nivel con campo de nombre.",
    },
    {
      numero: 4,
      titulo: "Gestionar Géneros Musicales o Tipos de Entrenamiento",
      descripcion:
        'Ve a "Ajustes" → "Géneros Musicales". En academias de baile, administras géneros (Salsa, Tango, etc.). En academias de gym, administras tipos de entrenamiento. Misma estructura CRUD con paginación.',
      imagen: "ajustes-tipos-listado",
      nota: "Captura: Listado de géneros musicales o tipos de entrenamiento.",
    },
    {
      numero: 5,
      titulo: "Crear un nuevo género o tipo",
      descripcion:
        'Presiona el botón "Agregar" para abrir el formulario modal. Ingresa el nombre del género o tipo (ej: "Salsa", "Zumba") y confirma. Este tipo estará disponible en los horarios y asistencias.',
      imagen: "ajustes-tipos-alta",
      nota: "Captura: Modal de alta de género/tipo con campo de nombre.",
    },
    {
      numero: 6,
      titulo: "Gestionar Categorías de Cajas",
      descripcion:
        'Ve a "Ajustes" → "Categorías de Cajas" (solo plan Intermedio). Aquí defines las categorías para movimientos extraordinarios de caja. Cada categoría se define como "ingreso" o "egreso".',
      imagen: "ajustes-categorias-caja-listado",
      nota: "Captura: Listado de categorías de caja con tipo ingreso/egreso.",
    },
    {
      numero: 7,
      titulo: "Crear una categoría de caja",
      descripcion:
        'Presiona el botón "Agregar" para abrir el formulario modal. Ingresa el nombre de la categoría y selecciona si es "ingreso" o "egreso". Estas categorías se usan al registrar movimientos manuales en la caja.',
      imagen: "ajustes-categorias-caja-alta",
      nota: "Captura: Modal de alta de categoría con selector de tipo.",
    },
    {
      numero: 8,
      titulo: "Gestionar Tipos de Cuentas",
      descripcion:
        'Ve a "Ajustes" → "Tipos de Cuentas" (solo plan Intermedio). Aquí defines los métodos de pago disponibles (efectivo, tarjeta, transferencia, etc.). Se usan tanto en inscripciones como en movimientos de caja.',
      imagen: "ajustes-tipos-cuenta-listado",
      nota: "Captura: Listado de tipos de cuenta/métodos de pago.",
    },
    {
      numero: 9,
      titulo: "Crear un tipo de cuenta",
      descripcion:
        'Presiona el botón "Agregar" para abrir el formulario modal. Ingresa el nombre del método de pago (ej: "Efectivo", "Tarjeta de débito") y confirma. Este método estará disponible en inscripciones y caja.',
      imagen: "ajustes-tipos-cuenta-alta",
      nota: "Captura: Modal de alta de tipo de cuenta con campo de nombre.",
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
