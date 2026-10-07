import {
  MdOutlineAnalytics,
  MdOutlineSettingsSuggest,
  MdOutlineClass,
  MdOutlineAssignmentInd,
  MdOutlineMusicNote,
  MdOutlineCategory,
  MdOutlineAdminPanelSettings,
  MdOutlineSchool,
} from "react-icons/md";
import {
  PiStudentBold,
  PiPresentationChartBold,
  PiCardsBold,
  PiCalendarCheckBold,
} from "react-icons/pi";
import { BsCashStack } from "react-icons/bs";
import {
  LuClipboardCheck,
  LuUserPlus,
  LuLayers,
  LuCreditCard,
} from "react-icons/lu";

import type { SeccionMenu } from "./menu.types";

const AZUL = "#38bdf8";
const VIOLETA = "#a78bfa";
const AZUL_CLARO = "#60a5fa";
const VERDE = "#34d399"; // Color distintivo para administración/SaaS

export const SECCIONES_USUARIO: SeccionMenu[] = [
  {
    clave: "operaciones",
    etiqueta: "Operaciones",
    icono: MdOutlineAnalytics,
    items: [
      {
        etiqueta: "Asistencia",
        icono: LuClipboardCheck,
        ruta: "/asistencia",
        color: AZUL,
        planes: ["intermedio", "basico"],
      },
      {
        etiqueta: "Inscripciones",
        icono: LuUserPlus,
        ruta: "/list_inscrip",
        color: AZUL,
        planes: ["intermedio", "basico"],
      },
      {
        etiqueta: "Arqueo de Caja",
        icono: BsCashStack,
        ruta: "/caja_usuario",
        color: AZUL,
        planMinimo: "intermedio",
      },
      {
        etiqueta: "Listado Cajas",
        icono: PiCardsBold,
        ruta: "/caja_listado",
        color: AZUL,
        planMinimo: "intermedio",
      },
      {
        etiqueta: "Flyers y Novedades",
        icono: LuLayers,
        ruta: "/flayers",
        color: VIOLETA,
        planes: ["intermedio", "basico"],
      },
    ],
  },
  {
    clave: "gestion",
    etiqueta: "Gestión",
    icono: MdOutlineClass,
    items: [
      {
        etiqueta: "Alumnos Inscriptos",
        icono: PiStudentBold,
        ruta: "/user_alumno",
        color: VIOLETA,
        planes: ["intermedio", "basico"],
      },
      {
        etiqueta: "Profesores",
        icono: PiPresentationChartBold,
        ruta: "/user_profesores",
        color: VIOLETA,
        planes: ["intermedio", "basico"],
      },
      {
        etiqueta: "Planes Pago",
        icono: PiCardsBold,
        ruta: "/user_planes",
        color: VIOLETA,
        planes: ["intermedio", "basico"],
      },
      {
        etiqueta: "Horarios",
        icono: PiCalendarCheckBold,
        ruta: "/horario_page",
        color: VIOLETA,
        planes: ["intermedio", "basico"],
      },
    ],
  },
  {
    clave: "niveles",
    etiqueta: "Configuración",
    icono: MdOutlineSettingsSuggest,
    items: [
      {
        etiqueta: "Niveles",
        icono: LuLayers,
        ruta: "/user_nivel",
        color: AZUL_CLARO,
        planes: ["intermedio", "basico"],
      },
      {
        etiqueta: "Géneros Musicales",
        icono: MdOutlineMusicNote,
        ruta: "/user_tipo",
        color: AZUL_CLARO,
        tamano: 20,
        planes: ["intermedio", "basico"],
      },
      {
        etiqueta: "Categoría Cajas",
        icono: MdOutlineAssignmentInd,
        ruta: "/user_categoria_caja",
        color: AZUL_CLARO,
        planMinimo: "intermedio",
      },
      {
        etiqueta: "Tipos Cuentas",
        icono: MdOutlineCategory,
        ruta: "/user_tipo_cuenta",
        color: AZUL_CLARO,
        planMinimo: "intermedio",
      },
    ],
  },
];

export const SECCIONES_ADMINISTRADOR: SeccionMenu[] = [
  {
    clave: "administracion",
    etiqueta: "Administración SaaS",
    icono: MdOutlineAdminPanelSettings,
    items: [
      {
        etiqueta: "Escuelas",
        icono: MdOutlineSchool,
        ruta: "/admin/escuelas",
        color: VERDE,
      },
      {
        etiqueta: "Planes SaaS",
        icono: LuCreditCard,
        ruta: "/admin/planes_saas",
        color: VERDE,
      },
      {
        etiqueta: "Usuarios ",
        icono: LuCreditCard,
        ruta: "/admin/usuarios_admin",
        color: AZUL_CLARO,
      },
    ],
  },
];
