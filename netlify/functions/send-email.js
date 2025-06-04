const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { name, email, message } = JSON.parse(event.body);

  // Δημιουργία transporter αντικειμένου χρησιμοποιώντας SMTP
  // Αντικαταστήστε με τα δικά σας διαπιστευτήρια SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // π.χ. 'smtp.gmail.com' ή 'smtp.mail.yahoo.com'
    port: process.env.EMAIL_PORT, // π.χ. 465 (για SSL) ή 587 (για TLS)
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Το email σας
      pass: process.env.EMAIL_PASS, // Ο κωδικός πρόσβασης ή ο κωδικός εφαρμογής
    },
  });

  try {
    await transporter.sendMail({
      from: `"${name}" <${email}>`, // Ο αποστολέας (από τη φόρμα)
      to: 'amkeinteraction@gmail.com', // Η διεύθυνση στην οποία θέλετε να σταλούν τα emails
      subject: `New contact form submission from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong> ${message}</p>`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully!' }),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to send email.', error: error.message }),
    };
  }
};
