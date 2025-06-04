const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    // Μόνο αιτήματα POST επιτρέπονται
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);

        // Έλεγχος αν το checkbox αποδοχής όρων είναι τσεκαρισμένο
        if (!data.acceptTerms) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Terms and Privacy Policy must be accepted.' }),
            };
        }

        // Αναγνώριση τύπου φόρμας, με default σε "Επικοινωνίας"
        const formType = data.formType || "Επικοινωνίας";

        let subjectToAMKE = '';
        let emailBodyToAMKE = '';
        let subjectToUser = '';
        let emailBodyToUser = '';

        const recipientEmailAMKE = 'amkeinteraction@gmail.com'; // Το email της ΑΜΚΕ

        // Γλώσσα του χρήστη (αν υπάρχει από τη φόρμα ή default 'el')
        const userLanguage = data.language || 'el';

        // Κείμενα για το αυτοματοποιημένο email προς τον χρήστη (πολύγλωσσα)
        const autoReplyTexts = {
            el: {
                subject: 'Επιβεβαίωση Παραλαβής Μηνύματος - ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ',
                heading: 'Ευχαριστούμε για το μήνυμά σας!',
                body: 'Λάβαμε το μήνυμά σας και θα επικοινωνήσουμε μαζί σας το συντομότερο δυνατό. Ακολουθεί μια περίληψη των πληροφοριών που υποβάλατε:',
                closing: 'Με εκτίμηση,<br>Η Ομάδα της ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ',
                formDetails: {
                    fullName: 'Όνομα',
                    email: 'Email',
                    phone: 'Τηλέφωνο',
                    addressCity: 'Πόλη',
                    addressLine: 'Διεύθυνση',
                    organization: 'Οργανισμός/Εταιρεία',
                    message: 'Μήνυμα/Σχόλια'
                },
                logoHtml: '<img src="https://raw.githubusercontent.com/ARISALAB/diethnis/main/BIG.jpg" alt="Λογότυπο ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ" style="max-width: 150px; height: auto; display: block; margin: 0 auto 20px auto;">'
            },
            en: {
                subject: 'Message Received Confirmation - N.P.O. INTERNATIONAL ACTION',
                heading: 'Thank you for your message!',
                body: 'We have received your message and will get back to you as soon as possible. Below is a summary of the information you submitted:',
                closing: 'Sincerely,<br>The N.P.O. INTERNATIONAL ACTION Team',
                formDetails: {
                    fullName: 'Full Name',
                    email: 'Email',
                    phone: 'Phone',
                    addressCity: 'City',
                    addressLine: 'Address',
                    organization: 'Organization/Company',
                    message: 'Message/Comments'
                },
                logoHtml: '<img src="https://raw.githubusercontent.com/ARISALAB/diethnis/main/BIG.jpg" alt="N.P.O. INTERNATIONAL ACTION Logo" style="max-width: 150px; height: auto; display: block; margin: 0 auto 20px auto;">'
            }
        };

        const currentAutoReplyText = autoReplyTexts[userLanguage] || autoReplyTexts['el']; // Fallback στα Ελληνικά

        // --- Διαμόρφωση Email προς την ΑΜΚΕ και τον Χρήστη, ανάλογα με τον τύπο της φόρμας ---
        if (formType === "Εθελοντισμός") {
            subjectToAMKE = `Νέα Αίτηση Εθελοντισμού από ${data.fullName || 'Άγνωστο Όνομα'} - ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ`;
            emailBodyToAMKE = `
                <h2>Νέα Αίτηση Εθελοντισμού</h2>
                <p><strong>Όνομα:</strong> ${data.fullName || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Email:</strong> ${data.email || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Τηλέφωνο:</strong> ${data.phone || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Πόλη:</strong> ${data.addressCity || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Διεύθυνση:</strong> ${data.addressLine || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Μήνυμα/Σχόλια:</strong><br>${data.message || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Αποδοχή Όρων:</strong> Ναι</p>
            `;
            // Διαμόρφωση Email προς τον Χρήστη
            subjectToUser = currentAutoReplyText.subject;
            emailBodyToUser = `
                ${currentAutoReplyText.logoHtml}
                <h2>${currentAutoReplyText.heading}</h2>
                <p>${currentAutoReplyText.body}</p>
                <hr>
                <p><strong>${currentAutoReplyText.formDetails.fullName}:</strong> ${data.fullName || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.email}:</strong> ${data.email || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.phone}:</strong> ${data.phone || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.addressCity}:</strong> ${data.addressCity || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.addressLine}:</strong> ${data.addressLine || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.message}:</strong><br>${data.message || 'N/A'}</p>
                <hr>
                <p>${currentAutoReplyText.closing}</p>
            `;

        } else if (formType === "Μέλος") {
            subjectToAMKE = `Νέα Αίτηση Μέλους από ${data.fullName || 'Άγνωστο Όνομα'} - ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ`;
            emailBodyToAMKE = `
                <h2>Νέα Αίτηση Μέλους</h2>
                <p><strong>Όνομα:</strong> ${data.fullName || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Email:</strong> ${data.email || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Τηλέφωνο:</strong> ${data.phone || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Πόλη:</strong> ${data.addressCity || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Διεύθυνση:</strong> ${data.addressLine || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Μήνυμα/Σχόλια:</strong><br>${data.message || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Αποδοχή Όρων:</strong> Ναι</p>
            `;
            // Διαμόρφωση Email προς τον Χρήστη
            subjectToUser = currentAutoReplyText.subject;
            emailBodyToUser = `
                ${currentAutoReplyText.logoHtml}
                <h2>${currentAutoReplyText.heading}</h2>
                <p>${currentAutoReplyText.body}</p>
                <hr>
                <p><strong>${currentAutoReplyText.formDetails.fullName}:</strong> ${data.fullName || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.email}:</strong> ${data.email || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.phone}:</strong> ${data.phone || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.addressCity}:</strong> ${data.addressCity || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.addressLine}:</strong> ${data.addressLine || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.message}:</strong><br>${data.message || 'N/A'}</p>
                <hr>
                <p>${currentAutoReplyText.closing}</p>
            `;
        } else if (formType === "Χορηγός") {
            subjectToAMKE = `Νέα Αίτηση Χορηγίας από ${data.fullName || 'Άγνωστο Όνομα'} - ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ`;
            emailBodyToAMKE = `
                <h2>Νέα Αίτηση Χορηγίας</h2>
                <p><strong>Όνομα:</strong> ${data.fullName || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Email:</strong> ${data.email || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Τηλέφωνο:</strong> ${data.phone || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Όνομα Εταιρείας:</strong> ${data.companyName || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Μήνυμα/Σχόλια:</strong><br>${data.message || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Αποδοχή Όρων:</strong> Ναι</p>
            `;
            // Διαμόρφωση Email προς τον Χρήστη
            subjectToUser = currentAutoReplyText.subject;
            emailBodyToUser = `
                ${currentAutoReplyText.logoHtml}
                <h2>${currentAutoReplyText.heading}</h2>
                <p>${currentAutoReplyText.body}</p>
                <hr>
                <p><strong>${currentAutoReplyText.formDetails.fullName}:</strong> ${data.fullName || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.email}:</strong> ${data.email || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.phone}:</strong> ${data.phone || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.organization}:</strong> ${data.companyName || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.message}:</strong><br>${data.message || 'N/A'}</p>
                <hr>
                <p>${currentAutoReplyText.closing}</p>
            `;
        } else { // Για φόρμα Επικοινωνίας (formType === "Επικοινωνίας" ή απουσιάζει)
            subjectToAMKE = `Νέο μήνυμα από ${data.name || 'Άγνωστο Όνομα'} - ΑΜΚΕ ΔΙΕΘΝΗΣ ΔΡΑΣΗ`;
            emailBodyToAMKE = `
                <h2>Νέο Μήνυμα Επικοινωνίας</h2>
                <p><strong>Όνομα:</strong> ${data.name || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Email:</strong> ${data.email || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Μήνυμα:</strong><br>${data.message || 'Δεν παρασχέθηκε'}</p>
                <p><strong>Αποδοχή Όρων:</strong> Ναι</p>
            `;
            // Διαμόρφωση Email προς τον Χρήστη
            subjectToUser = currentAutoReplyText.subject;
            emailBodyToUser = `
                ${currentAutoReplyText.logoHtml}
                <h2>${currentAutoReplyText.heading}</h2>
                <p>${currentAutoReplyText.body}</p>
                <hr>
                <p><strong>${currentAutoReplyText.formDetails.fullName}:</strong> ${data.name || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.email}:</strong> ${data.email || 'N/A'}</p>
                <p><strong>${currentAutoReplyText.formDetails.message}:</strong><br>${data.message || 'N/A'}</p>
                <hr>
                <p>${currentAutoReplyText.closing}</p>
            `;
        }

        // Ρυθμίσεις Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_SECURE === 'true', // Χρησιμοποιεί SSL/TLS αν είναι 'true'
            auth: {
                user: process.env.EMAIL_USER, // Το email από το οποίο στέλνετε (π.χ. το δικό σας Gmail)
                pass: process.env.EMAIL_PASS, // Ο κωδικός ή το App Password του email
            },
        });

        // Email options για την ΑΜΚΕ
        const mailOptionsToAMKE = {
            from: process.env.EMAIL_USER, // Από ποιο email στέλνετε
            to: recipientEmailAMKE, // Το email της ΑΜΚΕ
            subject: subjectToAMKE,
            html: emailBodyToAMKE,
            replyTo: data.email // Επιτρέπει στην ΑΜΚΕ να απαντήσει απευθείας στον χρήστη
        };

        // Email options για τον Χρήστη (αυτοματοποιημένη απάντηση)
        const mailOptionsToUser = {
            from: process.env.EMAIL_USER, // Από ποιο email στέλνετε
            to: data.email, // Το email του χρήστη που συμπλήρωσε τη φόρμα
            subject: subjectToUser,
            html: emailBodyToUser,
            replyTo: recipientEmailAMKE // Επιτρέπει στον χρήστη να απαντήσει στο email της ΑΜΚΕ
        };

        // Στέλνουμε και τα δύο emails
        await transporter.sendMail(mailOptionsToAMKE);
        if (data.email) { // Στέλνουμε απαντητικό μόνο αν υπάρχει email χρήστη
            await transporter.sendMail(mailOptionsToUser);
        }

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
