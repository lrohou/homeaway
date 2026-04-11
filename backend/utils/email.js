import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER || 'mock_user',
      pass: process.env.SMTP_PASS || 'mock_pass'
    }
  });

  const passLength = process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0;
  console.log(`📧 Tentative d'envoi d'email via ${process.env.SMTP_HOST || 'Service Gmail'} avec l'utilisateur ${process.env.SMTP_USER || 'mock_user'} (Pass: ${passLength} chars)`);
  try {
    // If no real credentials, just log to console
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'mock_user') {
      console.log('--- MOCK EMAIL SENT ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${text}`);
      console.log('-----------------------');
      return true;
    }

    const info = await transporter.sendMail({
      from: `"HomeAway" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Send email error:', error);
    return false;
  }
};
