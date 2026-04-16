import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT);
const mailTimeoutMs = Number(process.env.SMTP_TIMEOUT_MS || 15000);

const withSmtpTimeout = (promiseFactory, action) =>
  Promise.race([
    promiseFactory(),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`SMTP ${action} timeout after ${mailTimeoutMs}ms`));
      }, mailTimeoutMs);
    }),
  ]);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
  connectionTimeout: mailTimeoutMs,
  greetingTimeout: mailTimeoutMs,
  socketTimeout: mailTimeoutMs,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendMail = async (options) =>
  withSmtpTimeout(() => transporter.sendMail(options), 'send');

export const verifyMailerConnection = async () =>
  withSmtpTimeout(() => transporter.verify(), 'verify');

const mailer = {
  transporter,
  sendMail,
  verifyMailerConnection,
};

export default mailer;
