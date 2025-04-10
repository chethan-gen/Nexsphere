import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Load environment variables
const {
  EMAIL_USER,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REFRESH_TOKEN,
} = process.env;

// Create an OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground' // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: OAUTH_REFRESH_TOKEN,
});

const sendEmail = async (options) => {
  try {
    // Get a new access token
    const accessToken = await oauth2Client.getAccessToken();

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: EMAIL_USER,
        clientId: OAUTH_CLIENT_ID,
        clientSecret: OAUTH_CLIENT_SECRET,
        refreshToken: OAUTH_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    // Define email options
    const mailOptions = {
      from: `"NexSphere 🔐" <${EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html, // HTML body (optional)
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent: %s', info.messageId);
  } catch (error) {
    console.error('❌ Error sending email: ', error);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;
