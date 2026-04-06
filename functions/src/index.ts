import * as functions from "firebase-functions";
import * as nodemailer from "nodemailer";

export const sendEmail = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { customerName, customerEmail, customerPhone, service, date, time } = req.body;

    // In Firebase Functions, environment variables are loaded automatically from a .env file 
    // placed in the functions directory, or configured via Firebase Secret Manager.
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn("SMTP credentials not configured. Skipping email send.");
      res.status(200).json({ success: true, message: "Email skipped (not configured)" });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;
    const notificationEmail = process.env.NOTIFICATION_EMAIL || smtpUser;

    // Email to the customer
    const customerMailOptions = {
      from: `"Brown's IT Solutions" <${fromEmail}>`,
      to: customerEmail,
      subject: 'Appointment Confirmation - Brown\'s IT Solutions',
      text: `Hi ${customerName},\n\nYour appointment for ${service} is confirmed for ${date} at ${time}.\n\nIf you need to make any changes, please reply to this email or call us.\n\nBest regards,\nBrown's IT Solutions`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Appointment Confirmation</h2>
          <p>Hi ${customerName},</p>
          <p>Your appointment is confirmed. Here are the details:</p>
          <ul>
            <li><strong>Service:</strong> ${service}</li>
            <li><strong>Date:</strong> ${date}</li>
            <li><strong>Time:</strong> ${time}</li>
          </ul>
          <p>If you need to make any changes, please reply to this email or call us.</p>
          <br/>
          <p>Best regards,<br/><strong>Brown's IT Solutions</strong></p>
        </div>
      `,
    };

    // Email to the business
    const businessMailOptions = {
      from: `"Brown's IT Solutions System" <${fromEmail}>`,
      to: notificationEmail,
      subject: `New Appointment: ${service} - ${customerName}`,
      text: `New appointment booked via AI Voice Agent.\n\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\nService: ${service}\nDate: ${date}\nTime: ${time}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>New Appointment Booked</h2>
          <p>A new appointment has been booked via the AI Voice Agent.</p>
          <ul>
            <li><strong>Customer:</strong> ${customerName}</li>
            <li><strong>Email:</strong> ${customerEmail}</li>
            <li><strong>Phone:</strong> ${customerPhone}</li>
            <li><strong>Service:</strong> ${service}</li>
            <li><strong>Date:</strong> ${date}</li>
            <li><strong>Time:</strong> ${time}</li>
          </ul>
        </div>
      `,
    };

    await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(businessMailOptions)
    ]);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: String(error) });
  }
});
