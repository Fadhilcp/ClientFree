
import { transporter } from '../config/mail.config.js';
import { env } from '../config/env.config.js';


export const sendOtpEmail = async(to : string, otp : string, msg ?: string) : Promise<void> =>{
    
        const mailOptions = {
        from: `"ClientFree" <${env.SENDER_EMAIL}>`,
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
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to sent email',error)
    }
}