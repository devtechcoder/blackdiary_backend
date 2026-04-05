import * as nodemailer from "nodemailer";
import EmailLog, { EmailLogStatus } from "../models/EmailLog";
import EmailTemplate from "../models/EmailTemplate";
import { parseTemplate } from "../Utils/templateParser";

export type SendEmailPayload = {
  to: string;
  slug: string;
  data: Record<string, string>;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromAddress: string;
  fromName: string;
};

let cachedTransporter: nodemailer.Transporter | null = null;

const stripHtml = (html: string = ""): string => {
  return html
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const buildTemplateData = (data: Record<string, string> = {}) => {
  return {
    APP_NAME: process.env.APP_NAME || "Black Diary",
    ...data,
  };
};

const resolveSmtpConfig = (): SmtpConfig => {
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_FROM || user;
  const fromName = process.env.EMAIL_FROM_NAME || process.env.SMTP_FROM_NAME || process.env.APP_NAME || "Black Diary";

  if (!user) {
    throw new Error("SMTP_USER or MAIL_USERNAME is not configured");
  }

  if (!pass) {
    throw new Error("SMTP_PASS or MAIL_PASSWORD is not configured");
  }

  if (!fromAddress) {
    throw new Error("EMAIL_FROM is not configured");
  }

  return { host, port, secure, user, pass, fromAddress, fromName };
};

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const smtpConfig = resolveSmtpConfig();

  cachedTransporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });

  return cachedTransporter;
};

const formatSmtpResponse = (info: any): string => {
  if (!info) return "Email sent successfully";

  const response = info?.response ? `response=${info.response}` : "";
  const messageId = info?.messageId ? `messageId=${info.messageId}` : "";
  const accepted = Array.isArray(info?.accepted) ? `accepted=${info.accepted.join(",")}` : "";
  const rejected = Array.isArray(info?.rejected) ? `rejected=${info.rejected.join(",")}` : "";

  return [response, messageId, accepted, rejected].filter(Boolean).join(" | ") || "Email sent successfully";
};

const saveEmailLog = async (payload: { to: string; subject: string; slug: string; status: (typeof EmailLogStatus)[keyof typeof EmailLogStatus]; response: string; body?: string | null }) => {
  try {
    await EmailLog.create({
      ...payload,
      sentAt: new Date(),
    });
  } catch (logError: any) {
    console.error("[email.service] failed to persist email log", {
      slug: payload.slug,
      to: payload.to,
      error: logError?.message || logError,
    });
  }
};

export const sendEmail = async ({ to, slug, data }: SendEmailPayload): Promise<void> => {
  let template: any = null;
  let subject = "";
  let body = "";

  try {
    const smtpConfig = resolveSmtpConfig();

    if (!to) {
      throw new Error("Recipient email is required");
    }

    if (!slug) {
      throw new Error("Template slug is required");
    }

    template = await EmailTemplate.findOne({ slug }).lean();
    if (!template) {
      throw new Error(`Email template not found for slug: ${slug}`);
    }

    const templateData = buildTemplateData(data);
    subject = parseTemplate(template.subject || "", templateData);
    body = parseTemplate(template.description || "", templateData);
    const text = stripHtml(body) || body;

    const transporter = getTransporter();
    const sendInfo = await transporter.sendMail({
      from: {
        name: smtpConfig.fromName,
        address: smtpConfig.fromAddress,
      },
      to,
      subject,
      html: body,
      text,
    });

    await saveEmailLog({
      to,
      subject,
      slug,
      status: EmailLogStatus.SUCCESS,
      response: formatSmtpResponse(sendInfo),
      body,
    });

    console.info(`[email.service] sent email slug=${slug} to=${to}`);
  } catch (error: any) {
    const details = error?.response?.body?.errors || error?.message || error;
    const failureSubject = subject || (template?.subject ? parseTemplate(template.subject || "", buildTemplateData(data)) : slug);

    await saveEmailLog({
      to,
      subject: failureSubject || slug,
      slug,
      status: EmailLogStatus.FAILED,
      response: typeof details === "string" ? details : JSON.stringify(details),
      body: body || template?.description || null,
    });

    console.error("[email.service] failed to send email", {
      to,
      slug,
      details,
    });
    throw error;
  }
};

export default {
  sendEmail,
};
