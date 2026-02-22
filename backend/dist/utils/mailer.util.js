"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = void 0;
const mail_config_1 = require("../config/mail.config");
const env_config_1 = require("../config/env.config");
const sendOtpEmail = async (to, otp, msg) => {
    const mailOptions = {
        from: `"ClientFree" <${env_config_1.env.SENDER_EMAIL}>`,
        to,
        subject: 'Your OTP Code',
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>${msg ? msg : 'Welcome to ClientFree 👋'}</h2>
            <p>Your One-Time Password (OTP) is:</p>
            <h1 style="color: #2e86de;">${otp}</h1>
            <p>This code will expire in 1 minutes. Please do not share it with anyone.</p>
            <br/>
            <p>Thanks,<br/>The ClientFree Team</p>
        </div>
        `,
    };
    try {
        await mail_config_1.transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error('Failed to sent email', error);
    }
};
exports.sendOtpEmail = sendOtpEmail;
