import nodemailer from 'nodemailer';
import { transporter } from '../config/mail.config.js';


export const sendOtpEmail = async(to : string, otp : string) : Promise<void> =>{
    
        const mailOptions = {
        from: `"FreelanceHub" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Your OTP Code',
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Welcome to ClientFree 👋</h2>
            <p>Your One-Time Password (OTP) is:</p>
            <h1 style="color: #2e86de;">${otp}</h1>
            <p>This code will expire in 1 minutes. Please do not share it with anyone.</p>
            <br/>
            <p>Thanks,<br/>The FreelanceHub Team</p>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}