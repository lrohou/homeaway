import nodemailer from 'nodemailer';

export const initMailer = () => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const secure = process.env.SMTP_SECURE === 'true';

    console.log('\n========== INITIALIZING MAILER ==========');
    console.log('User:', user);
    console.log('Host:', host);
    console.log('Port:', port);
    console.log('Secure:', secure);
    console.log('Pass length:', pass?.length);
    console.log('=========================================\n');

    if (!user || !pass || !host || !port) {
        console.error('❌ CRITICAL: Missing email environment variables!');
        console.error('Required: SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT');
        return null;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: host,
            port: parseInt(port),
            secure: secure,
            auth: {
                user: user,
                pass: pass
            }
        });

        console.log('✅ Transporter created successfully');
        return transporter;
    } catch (error) {
        console.error('❌ Failed to create transporter:', error.message);
        return null;
    }
};

let transporter = null;

export const getMailer = () => {
    if (!transporter) {
        console.log('Creating new transporter...');
        transporter = initMailer();
    }
    return transporter;
};