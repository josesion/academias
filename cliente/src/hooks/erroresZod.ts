export interface ErrorBackend {
    campo: string;
    message: string;
    code: string;
}


interface ErroresTransformados {
    [key: string]: string;
}

export const transformErrores = (errorsArray: ErrorBackend[]): ErroresTransformados => {
return errorsArray.reduce((objetoAcumulador, errorActual) => {
    // Aquí el tipado de 'errorActual' nos asegura que 'campo' y 'message' existen.
    const nombreCampo = errorActual.campo;
    const mensaje = errorActual.message;
    
    objetoAcumulador[nombreCampo] = mensaje;
    
    return objetoAcumulador;
}, {} as ErroresTransformados);
};