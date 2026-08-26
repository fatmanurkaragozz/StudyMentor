import nodemailer from "nodemailer";
import { config } from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.gmailUser,
    pass: config.gmailAppPassword,
  },
});

async function sendMail(to: string, subject: string, html: string, replyTo?: string) {
  await transporter.sendMail({
    from: `"StudyMentor" <${config.gmailUser}>`,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendVerificationEmail(to: string, code: string) {
  await sendMail(
    to,
    "StudyMentor - E-posta Doğrulama Kodun",
    `<div style="font-family:sans-serif;max-width:420px;margin:0 auto">
      <h2>Hoş geldin!</h2>
      <p>Hesabını doğrulamak için aşağıdaki kodu kullan:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px">${code}</p>
      <p style="color:#64748b;font-size:12px">Bu kod 24 saat geçerlidir.</p>
    </div>`,
  );
}

export async function sendPasswordResetEmail(to: string, code: string) {
  await sendMail(
    to,
    "StudyMentor - Şifre Sıfırlama Kodun",
    `<div style="font-family:sans-serif;max-width:420px;margin:0 auto">
      <h2>Şifre Sıfırlama</h2>
      <p>Şifreni sıfırlamak için aşağıdaki kodu kullan:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px">${code}</p>
      <p style="color:#64748b;font-size:12px">Bu kod 15 dakika geçerlidir. Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.</p>
    </div>`,
  );
}

export async function sendFeedbackEmail(fromEmail: string, message: string) {
  await sendMail(
    config.gmailUser,
    "StudyMentor - Yeni Geri Bildirim",
    `<div style="font-family:sans-serif;max-width:420px;margin:0 auto">
      <h2>Yeni geri bildirim</h2>
      <p><strong>Gönderen:</strong> ${escapeHtml(fromEmail)}</p>
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    </div>`,
    fromEmail,
  );
}
