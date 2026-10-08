import { Resend } from 'resend';
import logger from './logger';

/** Parámetros de un correo a enviar por Resend. */
interface EnviarCorreoParams {
    from?: string; // Opcional, por si querés usar uno por defecto
    to: string;
    subject: string;
    html: string;
    /** Versión en texto plano para los clientes que no renderizan HTML. */
    text?: string;
    /** Dirección que recibe la respuesta del alumno. */
    replyTo?: string;
}

/** Resultado estandarizado de un intento de envío. */
type ResultadoEnvio =
    | { success: true; data?: unknown }
    | { success: false; error: unknown };

/** Cliente de Resend, creado bajo demanda (no en la importación) para que el
 *  server arranque aunque falte `RESEND_API_KEY` en el `.env`. */
let clienteResend: Resend | null = null;

/**
 * Obtiene el cliente de Resend usando la clave guardada en el `.env`.
 *
 * @function obtenerCliente
 * @returns {Resend | null} El cliente listo para usar, o `null` si falta `RESEND_API_KEY`.
 */
const obtenerCliente = (): Resend | null => {
    const clave = process.env.RESEND_API_KEY;

    if (!clave) return null;
    if (!clienteResend) clienteResend = new Resend(clave);

    return clienteResend;
};

/**
 * Remitente por defecto de los correos salientes.
 * Se cambia con la variable `RESEND_FROM` del `.env`, sin tocar código
 * (el día que se verifique el dominio pasa a ser el de la academia).
 *
 * @function remitentePorDefecto
 * @returns {string} Dirección en formato `Nombre <correo>`.
 */
const remitentePorDefecto = (): string =>
    process.env.RESEND_FROM?.trim() || 'Academia <onboarding@resend.dev>';

/**
 * Dirección de contacto de la academia (la misma que recibe los avisos de fallo).
 *
 * @function correoContacto
 * @returns {string} Correo vacío si no está definida `CORREO_ADMIN`.
 */
const correoContacto = (): string => process.env.CORREO_ADMIN?.trim() || '';

/**
 * URL del frontend (la página de login) que usa el botón "Iniciar Sesión".
 * Sale de `URL_CLIENTE`; si falta, se mantiene la que ya venía escrita en la plantilla.
 *
 * @function urlCliente
 * @returns {string} URL base sin barra final.
 */
const urlCliente = (): string =>
    (process.env.URL_CLIENTE?.trim() || 'https://academias-client-production.up.railway.app').replace(/\/+$/, '');

/**
 * Escapa los caracteres reservados de HTML para que los datos que viajan dentro
 * de la plantilla (nombre, correo, escuela) no rompan su estructura.
 *
 * @function escaparHtml
 * @param {string} valor - Texto crudo a escapar.
 * @returns {string} Texto seguro para insertar dentro del HTML.
 */
const escaparHtml = (valor: string): string =>
    valor
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

/**
 * Convierte cualquier error recibido de Resend en un texto legible para el log.
 *
 * @function obtenerMotivo
 * @param {unknown} error - Error devuelto por el SDK o una excepción.
 * @returns {string} Motivo en forma de cadena de texto.
 */
const obtenerMotivo = (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;

    try {
        return JSON.stringify(error);
    } catch {
        return String(error);
    }
};

/**
 * Envía un correo electrónico a través de Resend.
 *
 * Nunca lanza excepciones: siempre devuelve un objeto con `success` en `true` o `false`,
 * de modo que el llamador pueda decidir si registrar el fallo sin frenar su flujo.
 *
 * @async
 * @function enviarCorreo
 * @param {EnviarCorreoParams} params - Destinatario, asunto y HTML; opcionalmente texto plano, `replyTo` y remitente.
 * @returns {Promise<ResultadoEnvio>} Estado del envío con `data` o `error`.
 */
export const enviarCorreo = async ({
    to, subject, html, text, replyTo, from
}: EnviarCorreoParams): Promise<ResultadoEnvio> => {

    const cliente = obtenerCliente();

    if (!cliente) {
        const motivo = 'Falta la variable RESEND_API_KEY en el .env: el correo no se envió.';
        console.error(motivo);
        return { success: false, error: motivo };
    }

    try {
        const { data, error } = await cliente.emails.send({
            from: from || remitentePorDefecto(),
            to: [to],
            subject: subject,
            html: html,
            text: text,
            replyTo: replyTo,
        });

        if (error) {
            console.error("Error al enviar correo con Resend:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error("Excepción inesperada al enviar correo:", err);
        return { success: false, error: err };
    }
};

/**
 * Plantilla HTML del correo de bienvenida con las credenciales de acceso del alumno.
 *
 * @function generarPlantillaBienvenida
 * @param {string} nombreAlumno - Nombre del alumno (se escapa para el HTML).
 * @param {string} email - Correo de acceso al sistema.
 * @param {string} [passwordTemp] - Contraseña temporal generada en el alta.
 * @param {string} [nombreEscuela] - Razón social de la escuela que lo registró.
 * @returns {string} Documento HTML completo listo para enviar.
 */
export const generarPlantillaBienvenida = (
    nombreAlumno: string,
    email: string,
    passwordTemp?: string,
    nombreEscuela?: string
) => {
    const nombre = escaparHtml(nombreAlumno);
    const correo = escaparHtml(email);
    const escuela = nombreEscuela ? escaparHtml(nombreEscuela) : '';
    const urlLogin = escaparHtml(`${urlCliente()}/login`);

    const contacto = correoContacto();

    const titulo = escuela
        ? `¡Bienvenido/a a ${escuela}!`
        : '¡Bienvenido/a a la Plataforma!';

    const intro = escuela
        ? `Tus datos han sido registrados en <b>${escuela}</b> con éxito.`
        : 'Tus datos han sido registrados con éxito en el sistema.';

    const bloquePassword = passwordTemp
        ? `
                <p style="margin: 5px 0;"><b>Contraseña temporal:</b> ${escaparHtml(passwordTemp)}</p>
                <p style="margin: 10px 0 0 0; font-size: 13px; color: #6B7280;">Vas a poder cambiarla cuando ingreses por primera vez.</p>`
        : '';

    const bloqueContacto = contacto
        ? `
            <p style="text-align: center; font-size: 14px; color: #6B7280; margin-top: 25px;">
                ¿Necesitás ayuda? Escribinos a
                <a href="mailto:${escaparHtml(contacto)}" style="color: #4F46E5;">${escaparHtml(contacto)}</a>
            </p>`
        : '';

    const cierre = contacto
        ? 'Este mensaje lo generó el sistema automáticamente. Si necesitás ayuda, respondé a este correo.'
        : 'Este es un mensaje automático, por favor no respondas a este correo.';

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Credenciales de acceso</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6; padding: 20px 0;">
        <tr>
            <td align="center">
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; width: 100%; padding: 20px; background-color: #FFFFFF; border: 1px solid #eaeaea; border-radius: 8px;">
                    <h2 style="color: #4F46E5; text-align: center; margin-top: 0;">${titulo}</h2>
                    <p>Hola <b>${nombre}</b>,</p>
                    <p>${intro}</p>

                    <div style="background-color: #F9FAFB; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><b>Correo de acceso:</b> ${correo}</p>${bloquePassword}
                    </div>

                    <p>Ya podés ingresar para gestionar tus horarios, asistencias y novedades.</p>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${urlLogin}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Iniciar Sesión</a>
                    </div>${bloqueContacto}

                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #666; text-align: center;">${cierre}</p>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

/**
 * Versión en texto plano del correo de bienvenida, para los clientes de correo
 * que no renderizan HTML (y como respaldo de accesibilidad).
 *
 * @function generarTextoBienvenida
 * @param {string} nombreAlumno - Nombre del alumno.
 * @param {string} email - Correo de acceso al sistema.
 * @param {string} [passwordTemp] - Contraseña temporal generada en el alta.
 * @param {string} [nombreEscuela] - Razón social de la escuela que lo registró.
 * @returns {string} Cuerpo del correo en texto plano.
 */
export const generarTextoBienvenida = (
    nombreAlumno: string,
    email: string,
    passwordTemp?: string,
    nombreEscuela?: string
): string => {
    const titulo = nombreEscuela
        ? `¡Bienvenido/a a ${nombreEscuela}!`
        : '¡Bienvenido/a a la Plataforma!';

    const contacto = correoContacto();

    const lineas: (string | null)[] = [
        titulo,
        '',
        `Hola ${nombreAlumno},`,
        nombreEscuela
            ? `Tus datos han sido registrados en ${nombreEscuela} con éxito.`
            : 'Tus datos han sido registrados con éxito en el sistema.',
        '',
        `Correo de acceso: ${email}`,
        passwordTemp ? `Contraseña temporal: ${passwordTemp}` : null,
        passwordTemp ? 'Vas a poder cambiarla cuando ingreses por primera vez.' : null,
        '',
        `Iniciar Sesión: ${urlCliente()}/login`,
        contacto ? `¿Necesitás ayuda? Escribinos a ${contacto}` : null,
        '',
        contacto
            ? 'Este mensaje lo generó el sistema automáticamente.'
            : 'Este es un mensaje automático, por favor no respondas a este correo.',
    ];

    // Descarta las líneas opcionales que no corresponden, pero respeta los saltos de párrafo
    return lineas.filter(linea => linea !== null).join('\n');
};

/**
 * Plantilla HTML del aviso que recibe la casilla del administrador cuando falla
 * el envío de un correo al alumno.
 *
 * @function plantillaAvisoFallo
 * @param {string} contexto - Descripción del evento (ej. "Alta alumno 40100200").
 * @param {string} destinatario - Correo al que no llegó el mensaje.
 * @param {string} asunto - Asunto que se intentó enviar.
 * @param {string} motivo - Motivo del fallo reportado por Resend.
 * @returns {string} Documento HTML del aviso.
 */
const plantillaAvisoFallo = (contexto: string, destinatario: string, asunto: string, motivo: string): string => `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <title>Aviso de fallo de correo</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #F3F4F6; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px; color: #333;">
        <h2 style="color: #DC2626; margin-top: 0;">⚠ Falló el envío de un correo</h2>
        <p><b>Evento:</b> ${escaparHtml(contexto)}</p>
        <p><b>Destinatario:</b> ${escaparHtml(destinatario)}</p>
        <p><b>Asunto:</b> ${escaparHtml(asunto)}</p>
        <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 6px; padding: 12px;">
            <p style="margin: 0; font-family: monospace; font-size: 13px; white-space: pre-wrap;">${escaparHtml(motivo)}</p>
        </div>
        <p style="font-size: 12px; color: #666;">El detalle también quedó registrado en <code>logs/errores.log</code>.</p>
    </div>
</body>
</html>`;

/**
 * Despacha el envío de un correo en segundo plano, sin frenar el flujo que lo originó
 * (por ejemplo el alta de un alumno).
 *
 * Si el envío falla, deja dos rastros: el detalle en `logs/errores.log` y un aviso
 * en la casilla definida en `CORREO_ADMIN`.
 *
 * @function enviarCorreoEnBackground
 * @param {EnviarCorreoParams} params - Mismos parámetros que `enviarCorreo`.
 * @param {string} [contexto] - Descripción del evento para identificar el fallo en el log.
 * @returns {void} No devuelve nada: el resultado se registra en el log.
 */
export const enviarCorreoEnBackground = (params: EnviarCorreoParams, contexto = ''): void => {
    void (async () => {
        const resultado = await enviarCorreo(params);

        if (resultado.success) return;

        const motivo = obtenerMotivo(resultado.error);

        logger.error(
            `CORREO NO ENVIADO${contexto ? ` (${contexto})` : ''} | para: ${params.to} | asunto: "${params.subject}" | motivo: ${motivo}`
        );

        avisarFalloCorreo(params, motivo, contexto);
    })();
};

/**
 * Notifica por correo al administrador (`CORREO_ADMIN`) que falló el envío de un mensaje.
 * Si no está definida la variable, o si el propio aviso falla, solo se registra en el log
 * (no hay reenvíos en cadena).
 *
 * @async
 * @function avisarFalloCorreo
 * @param {EnviarCorreoParams} params - Correo que falló, para mostrar sus datos en el aviso.
 * @param {string} motivo - Motivo del fallo.
 * @param {string} contexto - Descripción del evento.
 * @returns {Promise<void>}
 */
const avisarFalloCorreo = async (
    params: EnviarCorreoParams,
    motivo: string,
    contexto: string
): Promise<void> => {
    const destino = correoContacto();

    if (!destino) return;

    const resultado = await enviarCorreo({
        to: destino,
        subject: '⚠ Aviso: falló el envío de un correo',
        html: plantillaAvisoFallo(contexto, params.to, params.subject, motivo),
        text: `Falló el envío de un correo.\n\nEvento: ${contexto}\nDestinatario: ${params.to}\nAsunto: ${params.subject}\nMotivo: ${motivo}`,
        replyTo: destino,
    });

    if (!resultado.success) {
        logger.error(`CORREO DE AVISO NO ENVIADO | para: ${destino} | motivo: ${obtenerMotivo(resultado.error)}`);
    }
};

/**
 * Revisa la configuración de correo al arrancar el server y deja en el log
 * los errores que van a impedir que los correos salgan bien.
 *
 * @function verificarConfiguracionCorreo
 * @returns {void}
 */
export const verificarConfiguracionCorreo = (): void => {
    if (!process.env.RESEND_API_KEY) {
        logger.error('RESEND_API_KEY no está definida en el .env: no se enviará ningún correo.');
    }

    const destinoPrueba = process.env.RESEND_DESTINO?.trim();

    if (!destinoPrueba && remitentePorDefecto().includes('resend.dev')) {
        logger.error(
            'RESEND_FROM usa el dominio de prueba resend.dev y no hay RESEND_DESTINO definida: ' +
            'los correos irían a la casilla del alumno y Resend los rechaza. ' +
            'Setear RESEND_DESTINO (modo prueba) o verificar el dominio.'
        );
    }
};
