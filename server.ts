import express from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Email sending endpoint
  app.post('/api/send-email', async (req, res) => {
    try {
      const { customerName, customerEmail, customerPhone, service, date, time } = req.body;

      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP credentials not configured. Skipping email send.");
        return res.status(200).json({ success: true, message: "Email skipped (not configured)" });
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
      const notificationEmail = process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER;

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
