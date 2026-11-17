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
        'Desde el menú lateral, ve a "Mi Escuela" → "Flyers y Novedades". Verás la página "Mis Flyers" con una grilla de los flyers publicados. Si aún no hay flyers, aparecerá un mensaje indicando que no hay flyers publicados y un botón "Crear primer flyer".',
      imagen: "flyers-visita-general",
      nota: "💡 Consejo: Los flyers son una excelente forma de promocionar eventos, clases especiales o novedades de tu escuela. Tus alumnos pueden verlos desde la página de la escuela.",
    },
    {
      numero: 2,
      titulo: "Crear un nuevo flyer",
      descripcion:
        'En el encabezado de la página, presiona el botón "Nuevo Flyer" para abrir el formulario modal. El formulario muestra los campos uno debajo del otro: título, descripción y el lienzo para subir la imagen.',
      imagen: "flyers-campos-texto",
      nota: "⚠️ Importante: Completá todos los campos antes de publicar. Un flyer sin título o sin imagen no se verá atractivo para los alumnos.",
    },
    {
      numero: 3,
      titulo: "Completar título y descripción",
      descripcion:
        'Escribe el título del flyer en el campo "Título" y una descripción breve en el campo "Descripción Flayer". El título aparecerá como encabezado y la descripción debajo de la imagen.',
      imagen: "flyers-campos-texto-titulo-decripcion",
      nota: "💡 Consejo: El título debe ser corto y llamativo (por ejemplo, '¡Clase abierta de Salsa!'). La descripción puede ser más larga y detallar fecha, hora y lugar del evento.",
    },
    {
      numero: 4,
      titulo: "Subir la imagen del flyer",
      descripcion:
        "En el lienzo de imagen, haz clic para seleccionar una imagen desde tu dispositivo. La imagen se previsualizará antes de publicar. Asegúrate de que tenga buena resolución y proporción adecuada.",
      imagen: "flyers-subir-imagen",
      nota: "💡 Consejo: Usá imágenes con buena resolución y proporción horizontal (aproximadamente 1200×630 píxeles) para que se vean bien tanto en computadora como en celular. Formatos recomendados: JPG o PNG.",
    },
    {
      numero: 5,
      titulo: "Publicar el flyer",
      descripcion:
        'Revisa que título, descripción e imagen sean correctos. Luego presiona el botón "Subir Flayer" para publicar. El flyer aparecerá inmediatamente en la grilla de flyers publicados.',
      imagen: "flyers-publicar",
      nota: "✅ Una vez publicado, el flyer queda visible inmediatamente para los alumnos. Podés verlo en la grilla de flyers publicados.",
    },
    {
      numero: 6,
      titulo: "Ver el detalle de un flyer",
      descripcion:
        "En la grilla de flyers publicados, haz clic en cualquier flyer para abrir un panel deslizable con el detalle: imagen completa, título y descripción. Puedes cerrar el panel haciendo clic fuera de él o en el botón de cerrar.",
      imagen: "flyers-detalle-panel",
      nota: "💡 Consejo: Usá el panel de detalle para revisar cómo se ve el flyer antes de compartirlo con los alumnos. Si algo no está bien, podés eliminarlo y crear uno nuevo.",
    },
    {
      numero: 7,
      titulo: "Eliminar un flyer",
      descripcion:
        "Desde el panel de detalle de un flyer, presiona el botón 'Eliminar este flyer'. Se abrirá un modal de confirmación. Confirma para eliminar el flyer. También puedes agregar más flyers desde la grilla presionando el botón 'Agregar flyer' (ícono +).",
      imagen: "flyers-eliminar",
      nota: "⚠️ Importante: Al eliminar un flyer, se pierde permanentemente. Si pensás que podés necesitarlo en el futuro, tomá una captura de pantalla antes de eliminarlo.",
    },
    {
      numero: 8,
      titulo: "Límite de flyers según el plan",
      descripcion:
        "El número máximo de flyers que puedes publicar depende del plan contratado. Cuando alcanzas el límite, el botón de agregar flyer ya no aparece hasta que elimines alguno existente.",
      nota: "💡 Consejo: Si alcanzaste el límite de flyers y necesitás publicar uno nuevo, eliminá primero los flyers más antiguos o menos relevantes para liberar espacio.",
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
