import nodemailer from "nodemailer"
import { config } from "./env.config.js"

export const transporter = nodemailer.createTransport({
    host:config.SMTP_HOST,
    port:config.SMTP_PORT,
    secure:false,
    auth:{
        user:config.GMAIL_USER,
        pass:config.GMAIL_PASS
    }
})