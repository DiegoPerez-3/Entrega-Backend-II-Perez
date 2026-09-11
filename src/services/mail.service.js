import { transporter } from '../config/mailer.js';
import { config } from '../config/env.config.js';
import { passwordResetTemplate } from '../templates/password-reset.template.js';

// Servicio de Mailing con Nodemailer.
// Encapsula la configuración del transporter y los templates de correo.
class MailService {
  // Envío genérico de correos electrónicos
  async sendMail({ to, subject, html, text }) {
    return transporter.sendMail({
      from: `"Ecommerce Coder" <${config.GMAIL_USER || 'no-reply@ecommerce.com'}>`,
      to,
      subject,
      html,
      text,
    });
  }

  // Envío específico de recuperación de contraseña utilizando el template HTML con botón
  async sendPasswordResetMail(to, resetUrl) {
    const template = passwordResetTemplate({ resetUrl });
    return this.sendMail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }
}

export const mailService = new MailService();
