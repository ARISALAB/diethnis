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

        let subjectToAMKE = '';
        let emailBodyToAMKE = '';
        let subjectToUser = ''; // ΝΕΟ: Θέμα για το email προς τον χρήστη
        let emailBodyToUser = ''; // ΝΕΟ: Περιεχόμενο για το email προς τον χρήστη

        const recipientEmailAMKE = 'amkeinteraction@gmail.com'; // Το email της ΑΜΚΕ

        // Γλώσσα του χρήστη (αν την έχουμε από τη φόρμα ή default)
        const userLanguage = data.language || 'el'; // Υποθέτουμε ότι υπάρχει ένα πεδίο 'language' στη φόρμα ή default 'el'

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
                }
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
                }
            }
        };

        const currentAutoReplyText = autoReplyTexts[userLanguage] || autoReplyTexts['el']; // Fallback to Greek

        // --- Διαμόρφωση Email προς την ΑΜΚΕ ---
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
        }
        else { // Για φόρμα Επικοινωνίας (formType === "Επικοινωνίας" ή απουσιάζει)
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
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Email options για την ΑΜΚΕ
        const mailOptionsToAMKE = {
            from: process.env.EMAIL_USER, // Το email από το οποίο στέλνετε (το δικό σας Gmail)
            to: recipientEmailAMKE, // Το email της ΑΜΚΕ
            subject: subjectToAMKE,
            html: emailBodyToAMKE,
            replyTo: data.email // Ο αποστολέας του email μπορεί να απαντήσει στον χρήστη
        };

        // Email options για τον Χρήστη (αυτοματοποιημένη απάντηση)
        const mailOptionsToUser = {
            from: process.env.EMAIL_USER, // Το email από το οποίο στέλνετε
            to: data.email, // Το email του χρήστη που συμπλήρωσε τη φόρμα
            subject: subjectToUser,
            html: emailBodyToUser,
            replyTo: recipientEmailAMKE // Ο χρήστης μπορεί να απαντήσει στο email της ΑΜΚΕ
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
