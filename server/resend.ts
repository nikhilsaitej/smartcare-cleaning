import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

export async function getResendClient() {
  const { apiKey } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: connectionSettings.settings.from_email
  };
}

export async function sendWelcomeEmail(to: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    await client.emails.send({
      from: fromEmail || 'SmartCare <noreply@smartcare.com>',
      to: [to],
      subject: 'Welcome to SmartCare Cleaning Solutions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to SmartCare</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e40af;">Account Created Successfully!</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Thank you for joining SmartCare Cleaning Solutions. Your account has been created successfully.
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              You can now browse our premium cleaning services and shop for housekeeping products directly from our website.
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px;">
                Best regards,<br>
                <strong>SmartCare Cleaning Solutions Team</strong>
              </p>
            </div>
          </div>
        </div>
      `
    });
    console.log('Welcome email sent to:', to);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    await client.emails.send({
      from: fromEmail || 'SmartCare <noreply@smartcare.com>',
      to: [to],
      subject: 'Password Reset Request - SmartCare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">SmartCare</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e40af;">Password Reset</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              You requested to reset your password. Click the button below to set a new one:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #475569; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #3b82f6; font-size: 12px; word-break: break-all;">
              ${resetLink}
            </p>
            <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    });
    console.log('Password reset email sent to:', to);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}

export async function sendContactConfirmationEmail(to: string, name: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    await client.emails.send({
      from: fromEmail || 'SmartCare <noreply@smartcare.com>',
      to: [to],
      subject: 'Thank you for contacting SmartCare Cleaning Solutions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">SmartCare Cleaning Solutions</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e40af;">Hello ${name}!</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Thank you for reaching out to us. We have received your message and our team will get back to you within 24-48 hours.
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              In the meantime, feel free to browse our cleaning services and products on our website.
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px;">
                Best regards,<br>
                <strong>SmartCare Cleaning Solutions Team</strong><br>
                Vijayawada, India
              </p>
            </div>
          </div>
        </div>
      `
    });
    console.log('Contact confirmation email sent to:', to);
  } catch (error) {
    console.error('Failed to send contact confirmation email:', error);
  }
}

export async function sendBookingConfirmationEmail(to: string, name: string, serviceName: string, date: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    await client.emails.send({
      from: fromEmail || 'SmartCare <noreply@smartcare.com>',
      to: [to],
      subject: 'Booking Confirmed - SmartCare Cleaning Solutions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">SmartCare Cleaning Solutions</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e40af;">Booking Confirmed!</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Hello ${name}, your booking has been confirmed.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Service:</strong> ${serviceName}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
            </div>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Our team will contact you shortly to confirm the timing and other details.
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px;">
                Best regards,<br>
                <strong>SmartCare Cleaning Solutions Team</strong>
              </p>
            </div>
          </div>
        </div>
      `
    });
    console.log('Booking confirmation email sent to:', to);
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
  }
}
