import nodemailer from 'nodemailer';

/**
 * Creates a nodemailer transporter based on environment variables
 */
const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');

  if (!user || user === 'mock_user' || !pass) {
    return null;
  }

  // Configuration for the transporter
  const config = {
    host,
    port,
    secure: port === 465, // true for 465, false for 587 (STARTTLS)
    auth: {
      user,
      pass
    }
  };

  // If using Gmail service specifically, it can sometimes be more reliable
  if (host.includes('gmail.com') && !process.env.SMTP_FORCE_HOST) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport(config);
};

export const sendEmail = async (to, subject, text, html) => {
  const transporter = createTransporter();

  const user = process.env.SMTP_USER || 'mock_user';
  console.log(`📧 Attempting to send email to ${to} via ${process.env.SMTP_HOST || 'Gmail'} (User: ${user})`);

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
      console.error('Hint: Network connection issue. Check your SMTP_HOST and SMTP_PORT.');
    }
    
    return false;
  }
};
