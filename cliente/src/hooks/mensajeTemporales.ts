
interface MensajesProps{
    tiempo : number,
    mensajeError : string,
    mensajeEspera  : string  ,
    setErrorGenerico : ( mensaje : string ) => void;
};

let timeoutMensaje: number | null = null;

export const mensajeErrorTemporal = ({
    tiempo,
    mensajeError,
    mensajeEspera,
    setErrorGenerico
}: MensajesProps) => {

    if (timeoutMensaje !== null ) {
        clearTimeout(timeoutMensaje);
    }

    setErrorGenerico(mensajeError);

    timeoutMensaje = window.setTimeout(() => { 
       
        setErrorGenerico(mensajeEspera);
        timeoutMensaje = null;
    }, tiempo * 1000);
};