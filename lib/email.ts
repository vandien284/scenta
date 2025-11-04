import nodemailer from "nodemailer";

interface MailerConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  secure?: boolean;
  from?: string;
}

interface VerificationEmailPayload {
  to: string;
  code: string;
  name?: string;
}

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

function resolveConfig(): MailerConfig {
  const secure = process.env.SMTP_SECURE
    ? ["true", "1", "yes"].includes(process.env.SMTP_SECURE.toLowerCase())
    : undefined;

  return {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    secure,
    from: process.env.MAIL_FROM ?? process.env.SMTP_FROM,
  };
}

async function getTransporter() {
  if (transporterPromise) {
    return transporterPromise;
  }

  const config = resolveConfig();
  if (!config.host || !config.port || !config.user || !config.pass) {
    return null;
  }

  transporterPromise = Promise.resolve(
    nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    })
  );

  try {
    const transporter = await transporterPromise;
    await transporter.verify();
    return transporter;
  } catch (error) {
    console.error("[email] Unable to verify SMTP configuration:", error);
    transporterPromise = null;
    return null;
  }
}

export async function sendVerificationEmail({
  to,
  code,
  name,
}: VerificationEmailPayload) {
  const transporter = await getTransporter();
  const fallbackFrom = "no-reply@scenta.local";
  const config = resolveConfig();
  const from = config.from || fallbackFrom;

  if (!transporter) {
    console.warn(
      "[email] SMTP credentials missing. Skipping email send. Verification code:",
      code
    );
    return {
      sent: false,
      message: "SMTP configuration is missing.",
    };
  }

  const displayName = name?.trim() || "bạn";
  const subject = "Mã xác thực đặt hàng tại Scenta";
  const text = [
    `Xin chào ${displayName},`,
    "",
    "Đây là mã xác thực cho đơn hàng của bạn tại Scenta.",
    `Mã của bạn là: ${code}`,
    "",
    "Mã có hiệu lực trong 10 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.",
    "",
    "Cảm ơn bạn đã tin tưởng Scenta!",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
      <p>Xin chào ${displayName},</p>
      <p>Đây là mã xác thực dành cho đơn hàng của bạn tại <strong>Scenta</strong>.</p>
      <p style="margin: 16px 0; font-size: 18px;">
        <span style="display: inline-block; padding: 12px 24px; border-radius: 8px; background: #111; color: #fff; letter-spacing: 2px;">
          ${code}
        </span>
      </p>
      <p>Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      <p>Trân trọng,<br />Đội ngũ Scenta</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error("[email] Unable to send verification email:", error);
    return {
      sent: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
