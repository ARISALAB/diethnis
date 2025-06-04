const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    // Μόνο αιτήματα POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);

        // Ελέγχουμε αν το checkbox αποδοχής όρων είναι τσεκαρισμένο
        if (!data.acceptTerms) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Terms and Privacy Policy must be accepted.' }),
            };
        }

        // Αναγνώριση τύπου φόρμας
        const formType = data.formType || "Επικοινωνίας"; // Default σε "Επικοινωνίας" αν δεν υπάρχει
        let subject = `Νέο μήνυμα από τη φόρμα ${formType} - ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ`;
        let emailBody = '';
        let recipientEmail = 'amkeinteraction@gmail.com'; // Το email στο οποίο θα στέλνονται

        if (formType === "Εθελοντισμός") {
            subject = `Νέα Αίτηση Εθελοντισμού από ${data.fullName} - ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ`;
            emailBody = `
                <h2>Νέα Αίτηση Εθελοντισμού</h2>
                <p><strong>Όνομα:</strong> ${data.fullName}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Τηλέφωνο:</strong> ${data.phone}</p>
                <p><strong>Πόλη:</strong> ${data.addressCity}</p>
                <p><strong>Διεύθυνση:</strong> ${data.addressLine}</p>
                <p><strong>Μήνυμα/Σχόλια:</strong><br>${data.message}</p>
                <p><strong>Αποδοχή Όρων:</strong> Ναι</p>
            `;
        } else { // Για φόρμα Επικοινωνίας (ή άλλες)
            subject = `Νέο μήνυμα από ${data.name} - ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ`;
            emailBody = `
                <h2>Νέο Μήνυμα Επικοινωνίας</h2>
                <p><strong>Όνομα:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Μήνυμα:</strong><br>${data.message}</p>
                <p><strong>Αποδοχή Όρων:</strong> Ναι</p>
            `;
        }

        // Ρυθμίσεις Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT), // Μετατροπή σε αριθμό
            secure: process.env.EMAIL_SECURE === 'true', // Μετατροπή από string σε boolean
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER, // Από το email που στέλνει
            to: recipientEmail, // Στο email της ΑΜΚΕ
            subject: subject,
            html: emailBody,
            replyTo: data.email // Ο αποστολέας του email μπορεί να απαντήσει στον χρήστη
        };

        await transporter.sendMail(mailOptions);

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
