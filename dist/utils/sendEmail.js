"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer_1.default.createTransport({
        host: config_1.default.email.host,
        port: parseInt(config_1.default.email.port || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: config_1.default.email.user,
            pass: config_1.default.email.password,
        },
    });
    // Send email
    const info = await transporter.sendMail({
        from: `"${config_1.default.email.from_name}" <${config_1.default.email.from}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
    });
    console.log('Email sent: %s', info.messageId);
    return info;
};
exports.sendEmail = sendEmail;
