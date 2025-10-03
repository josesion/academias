import { useState , useContext , useEffect} from "react";
import { Navigate, Outlet } from "react-router-dom";
import  Cookies  from "js-cookie";

import { RutasProtegidasContext  } from "./contexto/protectRutas";
import { VerificarPermisos } from "./servicio/permisosRutas";
import { ComponenteCargando } from "./componentes/Cargando/Cargando";


export const RutasPrivadas = () => {
    const { autenticado , setAutenticado, setUsuarioInfo ,usuarioInfo} = useContext(RutasProtegidasContext);
    const [cargando, setCargando] = useState(true);


useEffect(() => {
        async function verificarAutenticacion() {

            if (Cookies.get("token")) {
                const resultToken  = await VerificarPermisos();
                    
                if (resultToken.error === false) {
                        setCargando(false);
                        setAutenticado(true);

                    if (resultToken.data && resultToken.data !== null) {
                        setUsuarioInfo({
                            usuario: resultToken.data,
                            error: false
                        });

                    } 
                }else{
                    setAutenticado(false);
                    setCargando(false);
                    setUsuarioInfo(null);
                }
            }else{
                setAutenticado(false);
                setCargando(false)
            }

        };
verificarAutenticacion();

}, [] );


    if (cargando) {
        return <ComponenteCargando />;
    }
        if (!autenticado) {
            return <Navigate to="/login" replace />; 
        }
        return <Outlet />;
};
