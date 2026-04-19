import nodemailer from "nodemailer";

const mailPort = Number(process.env.MAIL_PORT || 587);

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: mailPort,
  secure: mailPort === 465,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});