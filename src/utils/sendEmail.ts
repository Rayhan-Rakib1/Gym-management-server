import nodemailer from 'nodemailer';
import config from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: parseInt(config.email.port || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });

  // Send email
  const info = await transporter.sendMail({
    from: `"${config.email.from_name}" <${config.email.from}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  console.log('Email sent: %s', info.messageId);
  return info;
};