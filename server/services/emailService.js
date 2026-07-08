const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send contact form notification to admin
 */
const sendContactNotification = async ({ name, email, subject, message }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    replyTo: email,
    subject: `New Contact Message: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 30px; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #4ADE80, #22c55e); padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 22px;">📩 New Contact Message</h1>
        </div>
        <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
          <p style="margin: 8px 0;"><strong style="color: #4ADE80;">From:</strong> ${name}</p>
          <p style="margin: 8px 0;"><strong style="color: #4ADE80;">Email:</strong> <a href="mailto:${email}" style="color: #4ADE80;">${email}</a></p>
          <p style="margin: 8px 0;"><strong style="color: #4ADE80;">Subject:</strong> ${subject}</p>
        </div>
        <div style="background: #1e293b; padding: 20px; border-radius: 8px;">
          <h3 style="color: #4ADE80; margin-top: 0;">Message:</h3>
          <p style="line-height: 1.7; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px; text-align: center;">
          This email was sent from your Portfolio contact form.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Send auto-reply to contact form sender
 */
const sendContactAutoReply = async ({ name, email }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"S. Mari Rajan" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Thanks for reaching out, ${name}! 🙌`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 30px; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #4ADE80, #22c55e); padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h1 style="color: #0f172a; margin: 0; font-size: 22px;">Hey ${name}! 👋</h1>
        </div>
        <div style="background: #1e293b; padding: 20px; border-radius: 8px;">
          <p style="line-height: 1.7;">Thank you for reaching out! I've received your message and will get back to you as soon as possible — usually within 24–48 hours.</p>
          <p style="line-height: 1.7;">In the meantime, feel free to check out my <a href="${process.env.CLIENT_URL}" style="color: #4ADE80;">portfolio</a> or connect with me on LinkedIn.</p>
          <p style="line-height: 1.7; margin-bottom: 0;">Best regards,<br><strong style="color: #4ADE80;">S. Mari Rajan</strong></p>
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px; text-align: center;">
          This is an automated reply. Please do not reply directly to this email.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { sendContactNotification, sendContactAutoReply };
