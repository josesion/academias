import { BrowserRouter, Route, Routes } from "react-router-dom"

// seccion de paginas
import { Inicio } from "./pagina/publico/inicio/Inicios";
import { Admin } from "./pagina/privado/Admin/Admin";
import { Login } from "./pagina/publico/Login/Login"; 
import { UsuarioPage } from "./pagina/privado/usuario/Usuario";
import { AlumnoPage } from "./pagina/publico/alumno/Alumno";

//Paginas AMB
import { AmbAlumnos } from "./pagina/privado/Alumnos/Alumnos";
import { AmbPlanesUsuarios } from "./pagina/privado/planes.usuario";
import { AmbProfesorUsuarios } from "./pagina/privado/profesor.usuario";
import { AbmNivelUsuarios } from "./pagina/privado/nivel.usuario";
import { AbmTipoUsuarios } from "./pagina/privado/tipo.usuario";

// seccion de componentes
import { MenuNav } from "./componentes/MenuNav/MenuNav";
import { RutasPrivadas } from "./Rutas.Protegidas";

//Seccion conetxtos
import { ProtectRutasProv } from "./contexto/protectRutas"


// estilos css
import "./app.css";

function App() {
  return (
<div className="app">
  <ProtectRutasProv>
      <BrowserRouter>
            <MenuNav></MenuNav>
        <Routes>
            <Route path="/" element={ <Inicio/> } />
            <Route path="/assistant_login" element={ <Login/> } />
            <Route path="/login" element={ <Login/> } />
            <Route path="/alum_manager_priv" element={ <AlumnoPage/> }/> 

            <Route  element={ <RutasPrivadas/> }>
                <Route path="/assistant_manager_priv" element={ <Admin/> } />

                <Route path="/user_manager_priv" element={ <UsuarioPage/> }/> 
                <Route path="/user_alumno" element={ < AmbAlumnos /> }/> 
                <Route path="/user_planes" element={ < AmbPlanesUsuarios /> }/> 
                <Route path="/user_profesores" element={ < AmbProfesorUsuarios /> }/> 
                <Route path="/user_nivel" element={ < AbmNivelUsuarios /> }/> 
                <Route path="/user_tipo" element={ < AbmTipoUsuarios /> }/> 

            </Route>
        </Routes>
          
      </BrowserRouter>
  </ProtectRutasProv>
</div>
  )
}

export default App