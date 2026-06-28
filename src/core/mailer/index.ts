import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || import.meta.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || import.meta.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || import.meta.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS || import.meta.env.SMTP_PASS;

function isConfigured() {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

export async function sendFormNotification(opts: {
  to: string;
  from: string;
  formTitle: string;
  values: Record<string, unknown>;
  pageUrl?: string;
}) {
  if (!isConfigured()) return;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  function escapeHtml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  const rows = Object.entries(opts.values)
    .filter(([k]) => !["formId", "formTitle", "emailTo"].includes(k))
    .map(([k, v]) => `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(String(v))}</td></tr>`)
    .join("");

  await transporter.sendMail({
    from: opts.from,
    to: opts.to,
    subject: `New submission: ${opts.formTitle}`,
    html: `
      <h2>New form submission — ${opts.formTitle}</h2>
      ${opts.pageUrl ? `<p>Page: <a href="${opts.pageUrl}">${opts.pageUrl}</a></p>` : ""}
      <table border="1" cellpadding="6" cellspacing="0">${rows}</table>
    `,
  });
}
