const actualizarEscuela = async (idEscuela: number, datosNuevos: any, nuevaImagen?: any) => {
    
    // 1. Primero buscamos la escuela actual en la base de datos para obtener el 'public_id' (la key vieja)
    const escuelaActual = await dataEscuelas.obtenerPorId(idEscuela);
    if (!escuelaActual) {
        return { error: true, message: "La escuela no existe", code: "ESCUELA_NO_ENCONTRADA" };
    }

    let urlImagenFinal = escuelaActual.urlImagen;
    let publicIdFinal = escuelaActual.public_id;

    // 2. ¿Mandó una imagen nueva?
    if (nuevaImagen) {
        // Validaciones previas de formato y tamaño (igual que al crear)...
        
        // A) Subimos la NUEVA imagen a R2
        const nuevaFileKey = await subirImagenR2(
            nuevaImagen.buffer, 
            nuevaImagen.nombre, 
            nuevaImagen.tipo
        );
        
        urlImagenFinal = `${process.env.R2_PUBLIC_URL}/${nuevaFileKey}`;
        publicIdFinal = nuevaFileKey;

        // B) Actualizamos los datos en la base de datos con la nueva URL y key
        await dataEscuelas.actualizarDatosConImagen(idEscuela, datosNuevos, urlImagenFinal, publicIdFinal);

        // C) ¡MUY IMPORTANTE! Una vez que se guardó en la BD con éxito, borramos la imagen VIEJA de R2
        if (escuelaActual.urlImagen) {
            try {
                await eliminarImagenR2(escuelaActual.urlImagen);
            } catch (error) {
                console.error("No se pudo borrar la imagen vieja de R2, pero la escuela se actualizó:", error);
                // Opcional: no rompes la request por esto, solo lo logueas, ya que lo prioritario era la nueva.
            }
        }
    } else {
        // Si no mandó imagen nueva, solo actualizamos los datos de texto
        await dataEscuelas.actualizarSoloDatos(idEscuela, datosNuevos);
    }

    return {
        error: false,
        message: "Escuela actualizada con éxito",
        code: "ESCUELA_UPDATE_OK"
    };
};