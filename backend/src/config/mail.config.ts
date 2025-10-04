import nodemailer from 'nodemailer'
import { env } from './env.config'

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth :{
        user: env.SENDER_EMAIL,
        pass: env.PASSKEY
    }
})