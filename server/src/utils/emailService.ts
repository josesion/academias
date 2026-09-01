import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EnviarCorreoParams {
    from?: string; // Opcional, por si querés usar uno por defecto
    to: string;
    subject: string;
    html: string;
}

export const enviarCorreo = async ({ to, subject, html, from }: EnviarCorreoParams) => {
    try {
        // Si la academia tiene configurado su propio remitente verificado, lo usa. 
        // Si no, cae en el de pruebas por defecto.
        const remitenteOficial = from || 'Academia <onboarding@resend.dev>';

        const { data, error } = await resend.emails.send({
            from: remitenteOficial,
            to: [to],
            subject: subject,
            html: html,
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

export const generarPlantillaBienvenida = (
    nombreAlumno: string, 
    email: string, 
    passwordTemp?: string
) => {
    return `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #4F46E5; text-align: center;">¡Bienvenido/a a la Plataforma!</h2>
            <p>Hola <b>${nombreAlumno}</b>,</p>
            <p>Tus datos han sido registrados con éxito en el sistema.</p>
            
            <div style="background-color: #F9FAFB; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><b>Correo de acceso:</b> ${email}</p>
                ${passwordTemp ? `<p style="margin: 5px 0;"><b>Contraseña temporal:</b> ${passwordTemp}</p>` : ''}
            </div>

            <p>Ya podés ingresar para gestionar tus horarios, asistencias y novedades.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://academias-client-production.up.railway.app/login" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Iniciar Sesión</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
            <p style="font-size: 12px; color: #666; text-align: center;">Este es un mensaje automático, por favor no respondas a este correo.</p>
        </div>
    `;
};