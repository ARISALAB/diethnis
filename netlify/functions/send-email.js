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

        let subject = '';
        let emailBody = '';
        const recipientEmail = 'amkeinteraction@gmail.com'; // Το email στο οποίο θα στέλνονται ΟΛΑ τα μηνύματα

        if (formType === "Εθελοντισμός") {
            subject = `Νέα Αίτηση Εθελοντισμού από ${data.fullName || 'Άγνωστο Όνομα'} - ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ`;
            emailBody = `
                <h2>Νέα Αίτηση Εθελοντισμού</h2>
                <p><strong>Όνομα:</strong> ${data.fullName || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Email:</strong> ${data.email || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Τηλέφωνο:</strong> ${data.phone || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Πόλη:</strong> ${data.addressCity || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Διεύθυνση:</strong> ${data.addressLine || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Μήνυμα/Σχόλια:</strong><br>${data.message || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Αποδοχή Όρων:</strong> Ναι</p>
            `;
        } else if (formType === "Μέλος") {
            subject = `Νέα Αίτηση Μέλους από ${data.fullName || 'Άγνωστο Όνομα'} - ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ`;
            emailBody = `
                <h2>Νέα Αίτηση Μέλους</h2>
                <p><strong>Όνομα:</strong> ${data.fullName || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Email:</strong> ${data.email || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Τηλέφωνο:</strong> ${data.phone || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Πόλη:</strong> ${data.addressCity || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Διεύθυνση:</strong> ${data.addressLine || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Μήνυμα/Σχόλια:</strong><br>${data.message || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Αποδοχή Όρων:</strong> Ναι</p>
            `;
        } else if (formType === "Χορηγός") {
            subject = `Νέα Αίτηση Χορηγίας από ${data.fullName || 'Άγνωστο Όνομα'} - ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ`;
            emailBody = `
                <h2>Νέα Αίτηση Χορηγίας</h2>
                <p><strong>Όνομα:</strong> ${data.fullName || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Email:</strong> ${data.email || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Τηλέφωνο:</strong> ${data.phone || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Οργανισμός/Εταιρεία:</strong> ${data.organization || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Μήνυμα/Σχόλια:</strong><br>${data.message || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Αποδοχή Όρων:</strong> Ναι</p>
            `;
        }
        else { // Για φόρμα Επικοινωνίας (formType === "Επικοινωνίας" ή απουσιάζει)
            subject = `Νέο μήνυμα από ${data.name || 'Άγνωστο Όνομα'} - ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ`;
            emailBody = `
                <h2>Νέο Μήνυμα Επικοινωνίας</h2>
                <p><strong>Όνομα:</strong> ${data.name || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Email:</strong> ${data.email || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Μήνυμα:</strong><br>${data.message || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Αποδοχή Όρων:</strong> Ναι</p>
            `;
        }

        // Ρυθμίσεις Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: subject,
            html: emailBody,
            replyTo: data.email
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
