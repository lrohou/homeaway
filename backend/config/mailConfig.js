import nodemailer from 'nodemailer';

export const initMailer = () => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    console.log('=== MAIL CONFIG DEBUG ===');
    console.log('SMTP_USER defined:', !!user);
    console.log('SMTP_USER value:', user ? user.substring(0, 5) + '***' : 'NOT SET');
    console.log('SMTP_PASS defined:', !!pass);
    console.log('========================');

    if (!user || !pass) {
        console.error('❌ CRITICAL: Email credentials are missing!');
        return null;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user,
                pass
            }
        });

        console.log('✅ Mail transporter initialized successfully');
        return transporter;
    } catch (error) {
        console.error('❌ Failed to initialize mail transporter:', error);
        return null;
    }
};

let transporter = null;

export const getMailer = () => {
    if (!transporter) {
        transporter = initMailer();
    }
    return transporter;
};