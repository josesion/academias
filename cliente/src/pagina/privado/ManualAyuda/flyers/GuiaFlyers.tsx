import { GuiaSeccion } from "../GuiaSeccion";

/**
 * Guía paso a paso: Flyers y Novedades.
 *
 * Explica cómo crear y publicar flyers promocionales de la escuela.
 */
export const GuiaFlyersPage = () => {
  const pasos = [
    {
      numero: 1,
      titulo: "Acceder a Flyers y Novedades",
      descripcion:
        'Desde el menú lateral, ve a "Mi Escuela" → "Flyers y Novedades". Verás la galería con los flyers publicados recientemente en formato carrusel.',
      imagen: "flyers-vista-general",
      nota: "Captura: Página de flyers con el carrusel de flyers publicados.",
    },
    {
      numero: 2,
      titulo: "Crear un nuevo flyer",
      descripcion:
        'Presiona el botón "+" para abrir el formulario de creación. Verás dos secciones: el lienzo de imagen a la izquierda y el formulario con título y descripción a la derecha.',
      imagen: "flyers-formulario-crear",
      nota: "Captura: Formulario de creación con lienzo y campos de título/descripción.",
    },
    {
      numero: 3,
      titulo: "Subir la imagen del flyer",
      descripcion:
        "En el lienzo de imagen, haz clic para seleccionar una imagen desde tu dispositivo. La imagen se previsualizará antes de publicar. Asegúrate de que tenga buena resolución y proporción adecuada.",
      imagen: "flyers-subir-imagen",
      nota: "Captura: Lienzo con imagen previsualizada.",
    },
    {
      numero: 4,
      titulo: "Completar título y descripción",
      descripcion:
        "Escribe un título atractivo y una descripción breve del flyer. El título aparecerá como encabezado y la descripción debajo de la imagen cuando los alumnos vean el flyer.",
      imagen: "flyers-campos-texto",
      nota: "Captura: Campos de título y descripción completados.",
    },
    {
      numero: 5,
      titulo: "Publicar el flyer",
      descripcion:
        "Revisa que imagen, título y descripción sean correctos. Luego confirma para publicar el flyer. Aparecerá inmediatamente en la galería y será visible para los alumnos en su panel.",
      imagen: "flyers-publicar",
      nota: "Captura: Botón de publicar y mensaje de éxito.",
    },
    {
      numero: 6,
      titulo: "Eliminar un flyer",
      descripcion:
        "Cada flyer publicado tiene un botón de eliminar. Haz clic en él y confirma la eliminación. El flyer se eliminará permanentemente y ya no será visible para los alumnos.",
      imagen: "flyers-eliminar",
      nota: "Captura: Botón de eliminar en un flyer publicado.",
    },
    {
      numero: 7,
      titulo: "Límite de flyers según el plan",
      descripcion:
        "El número máximo de flyers que puedes publicar depende del plan contratado. Si alcanzas el límite, deberás eliminar flyers existentes antes de crear nuevos.",
      imagen: "flyers-limite-plan",
      nota: "Captura: Mensaje de límite alcanzado (si aplica).",
    },
  ];

  return (
    <GuiaSeccion
      titulo="Flyers y Novedades"
      subtitulo="Aprende a crear y publicar flyers promocionales de tu escuela."
      carpetaImagenes="flyers"
      pasos={pasos}
    />
  );
};
