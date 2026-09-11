export const passwordResetTemplate = ({ resetUrl }) => ({
  subject: 'Recuperación de contraseña',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333; text-align: center;">Recuperación de Contraseña</h2>
      <p style="color: #666; font-size: 16px; line-height: 1.5;">
        Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar con el proceso:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          Restablecer Contraseña
        </a>
      </div>
      <p style="color: #888; font-size: 14px; line-height: 1.4;">
        <strong>Importante:</strong> Este enlace es válido durante <strong>1 hora</strong> a partir de su emisión. Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #aaa; font-size: 12px; text-align: center;">
        Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br />
        <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
      </p>
    </div>
  `,
  text: `Has solicitado restablecer tu contraseña. Ingresa al siguiente enlace para continuar: ${resetUrl}. Este enlace vencerá en 1 hora. Si no lo solicitaste, desestima este mensaje.`,
});
