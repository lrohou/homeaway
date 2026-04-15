import nodemailer from 'nodemailer';

/**
 * Creates a nodemailer transporter based on environment variables
 */
const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || user === 'mock_user' || !pass) {
    return null;
  }

  // Use Gmail service by default
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });
};

export const sendEmail = async (to, subject, text, html) => {
  const transporter = createTransporter();

  const user = process.env.SMTP_USER || 'mock_user';
  console.log(`📧 Attempting to send email to ${to} via Gmail (User: ${user})`);

  try {
    if (!transporter) {
      console.log('--- MOCK EMAIL (No real credentials found) ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('-------------------------------------------');
      return true;
    }

    const info = await transporter.sendMail({
      from: `"HomeAway" <${user}>`,
      to,
      subject,
      text,
      html
    });

    console.log('✅ Email sent successfully: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error);

    // Provide more context for common errors
    if (error.code === 'EAUTH') {
      console.error('Hint: Authentication failed. If using Gmail, make sure you use an "App Password".');
    } else if (error.code === 'ESOCKET') {
      console.error('Hint: Network connection issue. Check your SMTP configuration.');
    }

    return false;
  }
};