import { BrowserRouter, Route, Routes } from "react-router-dom";

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
import { AmbCategoriasCajaUsuarios } from "./pagina/privado/categoria.caja.usuario";

// Formulario para asistencia
import { FormularioAsistencia } from "./pagina/privado/FormularioAsistencia/FormularioAsistencia";

// seccion de componentes

import { RutasPrivadas } from "./Rutas.Protegidas";
import { LayoutConMenu, LayoutSinMenu } from "./hooks/menuManager";

//Seccion conetxtos
import { ProtectRutasProv } from "./contexto/protectRutas";

// estilos css
import "./app.css";

function App() {
  return (
    <div className="app">
      <ProtectRutasProv>
        <BrowserRouter>
          <Routes>
            {/*RUTAS SIN MENÚ */}

            <Route element={<LayoutSinMenu />}>
              <Route element={<RutasPrivadas />}>
                <Route path="/asistencia" element={<FormularioAsistencia />} />
              </Route>
            </Route>

            {/* 🔒 RUTAS CON MENÚ */}
            <Route element={<LayoutConMenu />}>
              <Route path="/" element={<Inicio />} />
              <Route path="/login" element={<Login />} />
              <Route path="/assistant_login" element={<Login />} />

              <Route element={<RutasPrivadas />}>
                <Route element={<LayoutSinMenu />}>
                  <Route path="/" element={<Inicio />} />
                </Route>

                <Route path="/assistant_manager_priv" element={<Admin />} />
                <Route path="/user_manager_priv" element={<UsuarioPage />} />
                <Route path="/user_alumno" element={<AmbAlumnos />} />
                <Route path="/user_planes" element={<AmbPlanesUsuarios />} />
                <Route
                  path="/user_profesores"
                  element={<AmbProfesorUsuarios />}
                />
                <Route path="/user_nivel" element={<AbmNivelUsuarios />} />
                <Route path="/user_tipo" element={<AbmTipoUsuarios />} />
                <Route
                  path="/user_categoria_caja"
                  element={<AmbCategoriasCajaUsuarios />}
                />
                <Route path="/alum_manager_priv" element={<AlumnoPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ProtectRutasProv>
    </div>
  );
}

export default App;
