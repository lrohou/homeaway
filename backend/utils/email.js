import { getMailer } from '../config/mailConfig.js';

export const sendEmail = async (to, subject, text, html) => {
  console.log('\n========== SENDING EMAIL ==========');
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
  console.log('Email to:', to);
  console.log('Subject:', subject);
  console.log('====================================\n');

  const transporter = getMailer();

  if (!transporter) {
    console.error('❌ ERROR: Transporter is NULL - Mail config failed!');
    return false;
  }

  try {
    console.log('📧 Transporter ready, attempting to send...');
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
    console.error('❌ Failed to send email:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    return false;
  }
};