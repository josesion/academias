import { BrowserRouter, Route, Routes } from "react-router-dom";
// seccion de paginas
import { Inicio } from "./pagina/publico/inicio/Inicios";
//import { Admin } from "./pagina/privado/Admin/Admin";
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
import { AmbTipoCuentasUsuario } from "./pagina/privado/tipo.cuenta";

//Formulario para Horarios
import { HorarioPagina } from "./pagina/privado/Horarios/Horarios";
//Formulario para Inscripcion
import { InscripcionPage } from "./pagina/privado/Inscripcion/Inscripcion";
// Formulario para asistencia
import { FormularioAsistencia } from "./pagina/privado/FormularioAsistencia/FormularioAsistencia";
// Formulario  Arqueo Caja
import { CajaArqueo } from "./pagina/privado/caja/Caja";
import { ListadoCajas } from "./pagina/privado/ListadoCajas/ListadoCajas";
// Formulario listado Inscripciones
import { ListadoInscripcionPage } from "./pagina/privado/Listado_inscripcion/ListadoInscrip";

// seccion de componentes de logicas
import { RutasPrivadas } from "./Rutas.Protegidas";
import { LayoutConMenu, LayoutSinMenu } from "./hooks/menuManager";

// Flayers
import { FlayersPag } from "./pagina/privado/Flayers/Flayers";

//Seccion conetxtos
import { ProtectRutasProv } from "./contexto/protectRutas";

//------------------------------Seccion para alumnos -------------------------------------

import { PrincipalAlumnos } from "./pagina/privado/SecionAlumnos/PrincipalAlumnos/PrincipalAlumnos";
import { PaginaUsuarios } from "./pagina/privado/Admin/PaginaUsuarios/PaginaUsuarios";
import { DataEscuela } from "./pagina/privado/SecionAlumnos/DataEscuela/DataEscual";

// -----------------------------Seccion Administrador -------------------------------------

// Página 404 (spec 018): atiende toda URL que no matchee con otra ruta.
import { NotFound } from "./pagina/privado/NoEncontrada/NotFound";

// Guard de rol para /admin/* (spec 018): evita la pantalla vacía cuando alguien
// escribe la URL a mano sin ser administrador. El bloqueo real es del server.
import { SoloAdministrador } from "./utils/guardAdmin";

import { DashboardAdministrador } from "./pagina/privado/Admin/Admin";
import { PaginaPlanes } from "./pagina/privado/Admin/PaginaPlanes/PaginaPlanes";
import { PaginaEscuela } from "./pagina/privado/Admin/PaginaEscuelas/PaginaEscuela";
// Empresas y anuncios (spec 017): las empresas son las dueñas de los anuncios,
// así que la de empresas va primero en el menú
import { PaginaEmpresas } from "./pagina/privado/Admin/PaginaEmpresas/PaginaEmpresas";
import { PaginaAnuncios } from "./pagina/privado/Admin/PaginaAnuncios/PaginaAnuncios";

// estilos css
import "./app.css";

function App() {
  return (
    <div className="app">
      <div className="fondo-animado">
        <div className="esfera esfera-1"></div>
        <div className="esfera esfera-2"></div>
        <div className="esfera esfera-3"></div>
        <div className="esfera esfera-4"></div>
        <div className="esfera esfera-5"></div>
        <div className="esfera esfera-6"></div>
      </div>
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
              {/* 🔒 Aca iria el condicional el modal de vencimietno  */}

              <Route path="/" element={<Inicio />} />
              <Route path="/login" element={<Login />} />
              <Route path="/assistant_login" element={<Login />} />

              <Route element={<RutasPrivadas />}>
                <Route path="/user_manager_priv" element={<UsuarioPage />} />
                <Route path="/user_alumno" element={<AmbAlumnos />} />
                <Route path="/user_planes" element={<AmbPlanesUsuarios />} />
                <Route
                  path="/user_tipo_cuenta"
                  element={<AmbTipoCuentasUsuario />}
                />
                <Route
                  path="/user_profesores"
                  element={<AmbProfesorUsuarios />}
                />
                <Route path="/user_nivel" element={<AbmNivelUsuarios />} />
                <Route path="/user_tipo" element={<AbmTipoUsuarios />} />
                <Route path="/caja_usuario" element={<CajaArqueo />} />
                <Route path="/caja_listado" element={<ListadoCajas />} />
                <Route path="/inscrip_page" element={<InscripcionPage />} />
                <Route path="/horario_page" element={<HorarioPagina />} />
                <Route path="/flayers" element={<FlayersPag />} />
                <Route
                  path="/list_inscrip"
                  element={<ListadoInscripcionPage />}
                />
                <Route
                  path="/user_categoria_caja"
                  element={<AmbCategoriasCajaUsuarios />}
                />
                <Route path="/alum_manager_priv" element={<AlumnoPage />} />

                {/* 🔒 RUTAS para el alumno */}
                <Route path="/data_escuela" element={<DataEscuela />} />
                <Route
                  path="/alumno_principal"
                  element={<PrincipalAlumnos />}
                />

                {/* 🔒 RUTAS  Administrativa */}
                <Route
                  path="/assistant_manager_priv"
                  element={<DashboardAdministrador />}
                />

                {/* Guard de rol (spec 018): el bloqueo real sigue siendo del
                    server (`soloAdministrador`); esto evita pintar la pantalla
                    de administración a quien no tiene ese rol. */}
                <Route element={<SoloAdministrador />}>
                  <Route path="/admin/planes_saas" element={<PaginaPlanes />} />
                  <Route path="/admin/escuelas" element={<PaginaEscuela />} />
                  <Route
                    path="/admin/usuarios_admin"
                    element={<PaginaUsuarios />}
                  />
                {/* Empresas y anuncios (spec 017) */}
                  <Route path="/admin/empresas" element={<PaginaEmpresas />} />
                  <Route path="/admin/anuncios" element={<PaginaAnuncios />} />
                </Route>
              </Route>

              {/* 404 (spec 018). Va AL FINAL: `path="*"` matchea cualquier URL
                  que no haya matcheado antes, asi que si se declara antes se
                  come todas las rutas. */}
              <Route element={<RutasPrivadas />}>
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ProtectRutasProv>
    </div>
  );
}

export default App;
