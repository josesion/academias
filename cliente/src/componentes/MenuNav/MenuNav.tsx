import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import {
  MdOutlineAnalytics,
  MdOutlineSettingsSuggest,
  MdOutlineClass,
  MdOutlineAssignmentInd,
  MdOutlineMusicNote,
} from "react-icons/md";
import {
  PiStudentBold,
  PiPresentationChartBold,
  PiCardsBold,
  PiCalendarCheckBold,
} from "react-icons/pi";
import { BsCashStack } from "react-icons/bs";

import { ImExit } from "react-icons/im";
import { GiBlackBook } from "react-icons/gi";
import { VscAccount } from "react-icons/vsc";
import { LuClipboardCheck, LuUserPlus, LuLayers } from "react-icons/lu";

// Seccion Contextos / Hooks
import { useMenuNav } from "../../hooks/navegacion";
import "../MenuNav/menuNav.css";

export const MenuNav = () => {
  const {
    rol,
    menuMobileAbierto,
    seccionAbierta,
    alternarSeccion,
    alternarMenuMobile,
    irA,
  } = useMenuNav();

  const irInicio = () => irA("/");
  const irLogin = () => irA("/login");

  // Navegación de Usuario
  const irAlumno = () => irA("/user_alumno");
  const irPlanes = () => irA("/user_planes");
  const irProfesores = () => irA("/user_profesores");
  const irNiveles = () => irA("/user_nivel");
  const irTipos = () => irA("/user_tipo");
  const irCategoriaCajas = () => irA("/user_categoria_caja");
  const irAsistencia = () => irA("/user_asistencia");
  //const irInscripciones = () => irA("/user_inscripciones");
  const irArqueoCaja = () => irA("/user_arqueo_caja");
  const irInscripciones = () => irA("/inscrip_page");
  const irHorarios = () => irA("/horario_page");
  return (
    <nav className="menu_nav">
      <div className="app-name-container">
        <p className="app-name">StudioPro</p>
      </div>

      <ul
        className={`menu_nav_lista ${menuMobileAbierto ? "abierto" : "menu"}`}
      >
        {/* VISTA VISITA */}
        {rol?.rol === "visita" && (
          <>
            <li className="alinear" onClick={irInicio}>
              <GiBlackBook size={20} /> Inicio
            </li>
            <li className="alinear" onClick={irLogin}>
              <VscAccount size={20} /> Login
            </li>
          </>
        )}

        {/* VISTA ADMINISTRADOR */}
        {rol?.rol === "administrador" && (
          <>
            <li className="alinear" onClick={irLogin}>
              <VscAccount size={20} /> Registrar
            </li>
            <li className="alinear" onClick={() => irA("/logout")}>
              <ImExit size={20} /> Cerrar Sesión
            </li>
          </>
        )}

        {/* VISTA USUARIO (OPERATIVO) */}
        {rol?.rol === "usuario" && (
          <>
            {/* SECCIÓN OPERACIONES */}
            <li
              className="menu-item alinear"
              onClick={() => alternarSeccion("operaciones")}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <MdOutlineAnalytics size={20} />
                <span>Operaciones</span>
              </div>
              {seccionAbierta === "operaciones" ? (
                <HiChevronUp size={15} />
              ) : (
                <HiChevronDown size={15} />
              )}

              {seccionAbierta === "operaciones" && (
                <ul className="submenu">
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      irAsistencia();
                    }}
                  >
                    <LuClipboardCheck size={18} color="#38bdf8" /> Asistencia
                  </li>
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      irInscripciones();
                    }}
                  >
                    <LuUserPlus size={18} color="#38bdf8" /> Inscripciones
                  </li>
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      irArqueoCaja();
                    }}
                  >
                    <BsCashStack size={18} color="#38bdf8" /> Arqueo de Caja
                  </li>
                </ul>
              )}
            </li>

            {/* SECCIÓN GESTIÓN */}
            <li
              className="menu-item alinear"
              onClick={() => alternarSeccion("gestion")}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <MdOutlineClass size={20} />
                <span>Gestión</span>
              </div>
              {seccionAbierta === "gestion" ? (
                <HiChevronUp size={15} />
              ) : (
                <HiChevronDown size={15} />
              )}

              {seccionAbierta === "gestion" && (
                <ul className="submenu">
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      irAlumno();
                    }}
                  >
                    <PiStudentBold size={18} color="#a78bfa" /> Alumnos
                  </li>
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      irProfesores();
                    }}
                  >
                    <PiPresentationChartBold size={18} color="#a78bfa" />{" "}
                    Profesores
                  </li>
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      irPlanes();
                    }}
                  >
                    <PiCardsBold size={18} color="#a78bfa" /> Planes
                  </li>
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      irHorarios();
                    }}
                  >
                    <PiCalendarCheckBold size={18} color="#a78bfa" /> Horarios
                  </li>
                </ul>
              )}
            </li>

            {/* SECCIÓN CONFIGURACIÓN */}
            <li
              className="menu-item alinear"
              onClick={() => alternarSeccion("niveles")}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <MdOutlineSettingsSuggest size={20} />
                <span>Configuración</span>
              </div>
              {seccionAbierta === "niveles" ? (
                <HiChevronUp size={15} />
              ) : (
                <HiChevronDown size={15} />
              )}

              {seccionAbierta === "niveles" && (
                <ul className="submenu">
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      irNiveles();
                    }}
                  >
                    <LuLayers size={18} color="#60a5fa" /> Niveles
                  </li>
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      irTipos();
                    }}
                  >
                    <MdOutlineMusicNote size={20} color="#60a5fa" /> Géneros
                    Musicales
                  </li>
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      irCategoriaCajas();
                    }}
                  >
                    <MdOutlineAssignmentInd size={18} color="#60a5fa" />{" "}
                    Categoría Cajas
                  </li>
                </ul>
              )}
            </li>

            {/* SALIR */}
            <li className="alinear" onClick={() => irA("/logout")}>
              <ImExit size={20} color="#796d6d" /> Salir
            </li>
          </>
        )}
      </ul>

      {/* BOTÓN HAMBURGUESA (SÓLO MÓVIL) */}
      <button className="btn_menu" onClick={alternarMenuMobile}>
        {menuMobileAbierto ? (
          <HiChevronUp size={25} />
        ) : (
          <HiChevronDown size={25} />
        )}
      </button>
    </nav>
  );
};
