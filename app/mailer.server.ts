import { promises as fs } from "node:fs";
import path from "node:path";
import { Resend } from "resend";

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
}

const driver = process.env.MAILER ?? "log";
const from = process.env.MAIL_FROM ?? "noreply@moviezone.local";
const logPath = path.join(process.cwd(), "logs", "mail.log");

let resend: Resend | undefined;

async function sendViaLog({
  to,
  subject,
  text,
}: SendEmailParams): Promise<void> {
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  const entry =
    [
      "=".repeat(72),
      `[${new Date().toISOString()}]`,
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "",
      text,
    ].join("\n") + "\n\n";
  await fs.appendFile(logPath, entry, "utf8");
}

async function sendViaResend({
  to,
  subject,
  text,
}: SendEmailParams): Promise<void> {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is required when MAILER=resend");
    }
    resend = new Resend(apiKey);
  }
  const result = await resend.emails.send({ from, to, subject, text });
  if (result.error) {
    throw new Error(`Resend send failed: ${result.error.message}`);
  }
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  if (driver === "resend") return sendViaResend(params);
  return sendViaLog(params);
}
