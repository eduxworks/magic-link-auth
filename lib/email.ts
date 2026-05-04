import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAILHOG_HOST || "localhost",
  port: parseInt(process.env.MAILHOG_PORT || "1027"),
  secure: false,
  auth: false,
});

export async function sendMagicLink(email: string, token: string) {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const magicLink = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: process.env.MAILHOG_FROM || "noreply@magiclink.local",
    to: email,
    subject: "Your Magic Link - Sign In",
    html: `
      <h2>Sign In to Magic Link</h2>
      <p>Click the link below to sign in to your account:</p>
      <p>
        <a href="${magicLink}" style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Sign In
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${magicLink}</p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this link, you can safely ignore this email.</p>
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
