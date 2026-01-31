import twilio from 'twilio';

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
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=twilio',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.account_sid || !connectionSettings.settings.api_key || !connectionSettings.settings.api_key_secret)) {
    throw new Error('Twilio not connected');
  }
  return {
    accountSid: connectionSettings.settings.account_sid,
    apiKey: connectionSettings.settings.api_key,
    apiKeySecret: connectionSettings.settings.api_key_secret,
    phoneNumber: connectionSettings.settings.phone_number
  };
}

export async function getTwilioClient() {
  const { accountSid, apiKey, apiKeySecret } = await getCredentials();
  return twilio(apiKey, apiKeySecret, {
    accountSid: accountSid
  });
}

export async function getTwilioFromPhoneNumber() {
  const { phoneNumber } = await getCredentials();
  return phoneNumber;
}

export async function sendBookingSMS(to: string, name: string, serviceName: string, date: string) {
  try {
    const client = await getTwilioClient();
    const fromNumber = await getTwilioFromPhoneNumber();
    
    await client.messages.create({
      body: `Hi ${name}! Your ${serviceName} booking for ${date} is confirmed. SmartCare Cleaning Solutions will contact you shortly. Thank you!`,
      from: fromNumber,
      to: to
    });
    console.log('Booking SMS sent to:', to);
  } catch (error) {
    console.error('Failed to send booking SMS:', error);
  }
}

export async function sendBookingWhatsApp(to: string, name: string, serviceName: string, date: string) {
  try {
    const client = await getTwilioClient();
    const fromNumber = await getTwilioFromPhoneNumber();
    
    await client.messages.create({
      body: `Hi ${name}! Your ${serviceName} booking for ${date} is confirmed. SmartCare Cleaning Solutions will contact you shortly. Thank you for choosing us!`,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`
    });
    console.log('Booking WhatsApp message sent to:', to);
  } catch (error) {
    console.error('Failed to send booking WhatsApp:', error);
  }
}

export async function sendContactSMS(to: string, name: string) {
  try {
    const client = await getTwilioClient();
    const fromNumber = await getTwilioFromPhoneNumber();
    
    await client.messages.create({
      body: `Hi ${name}! Thank you for contacting SmartCare Cleaning Solutions. We've received your message and will respond within 24-48 hours.`,
      from: fromNumber,
      to: to
    });
    console.log('Contact SMS sent to:', to);
  } catch (error) {
    console.error('Failed to send contact SMS:', error);
  }
}
