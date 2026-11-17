import { GuiaSeccion } from "../GuiaSeccion";

/**
 * Guía paso a paso: Inicio de Sesión.
 *
 * Explica cómo acceder al sistema desde la página de login hasta el panel principal.
 */
export const GuiaLoginPage = () => {
  const pasos = [
    {
      numero: 1,
      titulo: "Acceder a la página de inicio",
      descripcion:
        "Abre tu navegador y escribe la dirección de ELPHIS (por ejemplo: https://elphis.com). Verás la página de presentación con las funciones del sistema y un botón para comenzar.",
      imagen: "login-landing",
      nota: "Captura: Página de inicio (landing) con el formulario de registro.",
    },
    {
      numero: 2,
      titulo: "Ir al formulario de inicio de sesión",
      descripcion:
        'Si aún no te registraste, completa el formulario "Comenzar" en la landing. Si ya tienes cuenta, haz clic en "Iniciar sesión" en la parte superior derecha o ve directamente a la página /login.',
      imagen: "login-formulario",
      nota: "Captura: Formulario de login con campos de usuario y contraseña.",
    },
    {
      numero: 3,
      titulo: "Ingresar credenciales",
      descripcion:
        "Escribe tu nombre de usuario y contraseña en los campos correspondientes. Asegúrate de que las teclas estén en el idioma correcto y que no haya espacios adicionales.",
      imagen: "login-credenciales",
      nota: "Captura: Formulario con credenciales ingresadas (oculta la contraseña con asteriscos).",
    },
    {
      numero: 4,
      titulo: "Hacer clic en 'Ingresar'",
      descripcion:
        'Presiona el botón "Ingresar" o presiona Enter. El sistema verificará tus credenciales y te redirigirá automáticamente al panel correspondiente a tu rol.',
      imagen: "login-boton-ingresar",
      nota: "Captura: Botón 'Ingresar' resaltado en el formulario.",
    },
    {
      numero: 5,
      titulo: "Acceder al panel principal",
      descripcion:
        "Si las credenciales son correctas, serás redirigido al panel principal donde verás un saludo personalizado, métricas de tu academia y las secciones del menú lateral.",
      imagen: "login-panel-principal",
      nota: "Captura: Panel principal después de loguearse exitosamente.",
    },
  ];

  return (
    <GuiaSeccion
      titulo="Inicio de Sesión"
      subtitulo="Aprende cómo acceder al sistema ELPHIS paso a paso."
      carpetaImagenes="login"
      pasos={pasos}
    />
  );
};
