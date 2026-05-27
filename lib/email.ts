import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAILHOG_HOST || "localhost",
  port: parseInt(process.env.MAILHOG_PORT || "1027"),
  secure: false,
} as Parameters<typeof nodemailer.createTransport>[0]);

export async function sendMagicLink(email: string, token: string) {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const magicLink = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: process.env.MAILHOG_FROM || "noreply@magiclink.local",
    to: email,
    subject: "Tu Enlace Mágico - Inicia Sesión",
    html: `
      <h2>Inicia Sesión en Magic Link</h2>
      <p>Haz clic en el enlace a continuación para iniciar sesión en tu cuenta:</p>
      <p>
        <a href="${magicLink}" style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Iniciar Sesión
        </a>
      </p>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p>${magicLink}</p>
      <p>Este enlace expirará en 15 minutos.</p>
      <p>Si no solicitaste este enlace, puedes ignorar este correo de forma segura.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Failed to send email");
  }
}
