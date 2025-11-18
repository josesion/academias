// Seccion Bibliotecas
import { useState, useContext } from "react";
import {useNavigate}  from "react-router-dom";

// Seccion de Iconos
import { FaDoorClosed } from "react-icons/fa6";
import { VscAccount } from "react-icons/vsc";
import { MdAppRegistration } from "react-icons/md";
import { GiBlackBook } from "react-icons/gi";
import { HiChevronDown , HiChevronUp} from "react-icons/hi";
//Seccion importComponentes

//Seccion Contextos
import { RutasProtegidasContext } from "../../contexto/protectRutas";
//Seccion Estilos
import "../MenuNav/menuNav.css";



export const MenuNav = () =>{
    const navegar =  useNavigate();
    const {rol} = useContext(RutasProtegidasContext);

    const [menu , setMenu] = useState<boolean>(true);

    const irInicio = () =>{navegar("/")};
    const irLogin = () =>{navegar("/login")};

    //administrador

    //Usuario
    const irAlumno = () =>{ navegar("/user_alumno")};
    const irPlanes = () =>{ navegar("/user_planes")};
    const irProfesores = () =>{ navegar("/user_profesores")};

    return(

        <nav className="menu_nav  ">

            <div className="app-name-container">
                <p className="app-name">DanzaStudio Pro</p>
            </div>
            
            <ul className={`menu_nav_lista   ${menu ? 'abierto' : 'menu'}`}>
                {
                    rol?.rol === "visita" && (
                        <>
                            <li  className="alinear" onClick={irInicio}>
                                <GiBlackBook size={20} className="alinear" />Inicio
                            </li>
                            <li className="alinear" onClick={irLogin}>
                                <VscAccount size={20} className="alinear" />Login
                            </li>
                            <li  className="alinear">
                                <GiBlackBook size={20} className="alinear" />Contacto
                            </li>
                        </>
                    )
                }
                {
                    rol?.rol === "administrador" && (
                        <>
                            <li className="alinear" onClick={irLogin}>
                                <VscAccount size={20} className="alinear" />Registrar
                            </li>

                            <li className="alinear">
                                <FaDoorClosed size={20} className="alinear" />Cerrar
                            </li>
                            
                        </>
                    )
                }

                {
                    rol?.rol === "usuario" && (
                        <>
                            <li  className="alinear" onClick={ irAlumno } >
                                <MdAppRegistration size={20} className="alinear" />Alumnos
                            </li>

                            <li  className="alinear" onClick={ irPlanes } >
                                <MdAppRegistration size={20} className="alinear" />Planes
                            </li>

                            
                            <li  className="alinear" onClick={ irProfesores } >
                                <MdAppRegistration size={20} className="alinear" />Profesor
                            </li>

                        </>
                    )
                }
                
            </ul>


                <button
                    className="btn_menu"
                    onClick={ ()=>setMenu(!menu) }
                >{
                    menu ? 
                        <HiChevronUp size={25} />
                        :
                        <HiChevronDown size={25} /> 
                }</button>
        </nav> 
    )
};