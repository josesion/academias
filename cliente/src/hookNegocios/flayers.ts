import { getCarrucel, postFlayer } from "../servicio/flayer";
import { useFlayer } from "../hooks/flayers";



export const confiFlayer = ()=>{

    const config ={

        servicios : {
            getCarrucel : getCarrucel,
            postFlayer  : postFlayer
        },
        plan : 3
    };

    return useFlayer(config)

}