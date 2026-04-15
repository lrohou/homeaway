import { getMailer } from '../config/mailConfig.js';

export const sendEmail = async (to, subject, text, html) => {
  const transporter = getMailer();

  console.log(`📧 Attempting to send email to: ${to}`);
  console.log(`Subject: ${subject}`);

  if (!transporter) {
    console.error('❌ Email transporter not configured - running in MOCK mode');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"HomeAway" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    });

    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('⚠️ Authentication failed - check SMTP credentials');
    }
    return false;
  }
};