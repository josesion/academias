
interface ControlTiempoParams {
    tiempo: number;
    setErrorGenerico: (message: string | null) => void;
    setCarga: (isLoading: boolean) => void;
}


export const peticiones = ( parametros : ControlTiempoParams) => {
    const { tiempo, setErrorGenerico, setCarga } = parametros;

    const controlador = new AbortController();
    const signal = controlador.signal;
    const segEspera= tiempo * 1000;

    const timeoutId = setTimeout(() => {
        controlador.abort();
        setErrorGenerico("La solicitud ha tardado demasiado tiempo. Por favor, inténtelo de nuevo más tarde.");
        setCarga(false);
    }, segEspera);

    return { signal, timeoutId, controlador };

};



