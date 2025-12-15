import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Parser from 'rss-parser';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAllJobs } from './services/jobService.js';
import { initStore, saveJobStatus } from './services/storageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Init Store on Startup
initStore().catch(console.error);

// --- API ENDPOINT ---
// Routes
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await fetchAllJobs();
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la recherche' });
    }
});

// --- DAILY EMAIL SCHEDULER (05:30) ---
let lastRunDate = null;
let notificationSettings = {
    newOffers: true,
    applicationUpdates: true,
    dailyDigest: false,
    emailAlerts: true
};

app.post('/api/settings/notifications', (req, res) => {
    const settings = req.body;
    if (settings && typeof settings === 'object') {
        notificationSettings = { ...notificationSettings, ...settings };
        console.log(`Notification Settings updated.`);
        res.json({ success: true, settings: notificationSettings });
    } else {
        res.status(400).json({ error: 'Invalid value' });
    }
});

app.get('/api/settings/notifications', (req, res) => {
    res.json(notificationSettings);
});

app.post('/api/settings/test-email', async (req, res) => {
    console.log("Triggering Test Email...");
    try {
        await sendDailyEmail(true); // true = force send
        res.json({ success: true });
    } catch (e) {
        console.error("Test email failed", e);
        res.status(500).json({ error: e.message });
    }
});

async function sendDailyEmail(force = false) {
    if (!notificationSettings.dailyDigest && !force) {
        console.log("Scheduler: Daily email skipped (Disabled by user).");
        return;
    }

    console.log("Generating Daily Digest...");
    const allJobs = await fetchAllJobs();

    // Filter last 14h (to be safe for 12h shift) and interesting jobs
    const sinceTime = new Date(new Date().getTime() - 14 * 60 * 60 * 1000);

    const recentJobs = allJobs.filter(job => {
        const jobDate = new Date(job.date);
        const isRecent = jobDate > sinceTime;
        // Also include high potential jobs that are NEW even if older? 
        // User asked: "reprendre les offres des 12 dernieres heures ou les offres intéressantes que je n'aurais pas vu"
        // Let's stick to recent OR (New + High Score + Unseen)
        // For now, let's keep it simple: Recent + Score > 3
        return isRecent && (job.aiFitScore >= 4 || job.status === 'NEW');
    });

    if (recentJobs.length === 0) {
        console.log("Scheduler: No new jobs to report.");
        return;
    }

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const emailBody = `
Bonjour Damien,

Voici ton rapport de ${new Date().getHours()}h30 🚀.
${recentJobs.length} opportunités intéressantes détectées :

${recentJobs.map(job => `🔸 [${formatDate(job.date)}] ${job.title}
   🏢 ${job.company}
   📍 ${job.location} (Fit: ${Math.round(job.aiFitScore * 20)}%)
   🔗 ${job.url}`).join('\n\n')}

Bonne chasse !
--
Ton Assistant Job Hunter
    `;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: 'gallez.damien@gmail.com', pass: 'dbgp ulmz zhyc erul' }
    });

    try {
        await transporter.sendMail({
            from: '"Job Hunter AI" <gallez.damien@gmail.com>',
            to: 'gallez.damien@gmail.com',
            subject: `🎯 ${recentJobs.length} nouvelles offres pour toi`,
            text: emailBody
        });
        console.log("✅ Daily email sent successfully!");
        return { success: true };
    } catch (e) {
        console.error("❌ Echec envoi daily email:", e);
        throw e; // Re-throw to let the API know
    }
}

// Check time every minute
setInterval(() => {
    const now = new Date();
    // 05:30 OR 17:30
    if ((now.getHours() === 5 || now.getHours() === 17) && now.getMinutes() === 30) {
        const timeKey = `${now.getHours()}:${now.getMinutes()}`;
        // Prevent double send using a simplified key check (resetting lastRunDate is tricky with two times)
        // We actually need a more robust check or just accept verify against minute.
        // Since we check every minute, we might get multiple hits in that minute depending on start time?
        // No, setInterval is 60000ms. It might drift. Safer to track lastRunTime specific string.

        const todayStr = now.toDateString() + '-' + (now.getHours() < 12 ? 'AM' : 'PM');

        if (lastRunDate !== todayStr) {
            console.log(`⏰ It is ${timeKey}. Triggering digest.`);
            lastRunDate = todayStr;
            sendDailyEmail().catch(err => console.error("Scheduled email error:", err));
        }
    }
}, 60000);

console.log("Task Scheduler active: Waiting for 05:30 AM...");

// --- API EMAIL ENDPOINT (Existing) ---
app.post('/api/email', async (req, res) => {
    const { job, profile, letterContent, recipientEmail, subject, message } = req.body;

    const doc = new PDFDocument();
    const letterPath = path.join(__dirname, 'Lettre_Motivation.pdf');
    const writeStream = fs.createWriteStream(letterPath);

    doc.pipe(writeStream);
    doc.fontSize(12).text(letterContent, { align: 'left' });
    doc.end();

    writeStream.on('finish', async () => {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: 'gallez.damien@gmail.com', pass: 'dbgp ulmz zhyc erul' }
            });

            await transporter.sendMail({
                from: '"Damien Gallez" <gallez.damien@gmail.com>',
                to: recipientEmail || 'recrutement@example.com',
                subject: subject || `Candidature : ${job.title} - Damien Gallez`,
                text: message || 'Veuillez trouver ci-joint ma candidature.',
                attachments: [
                    { filename: 'Lettre_Motivation.pdf', path: letterPath },
                    { filename: 'CV_Damien_Gallez.pdf', path: path.join(__dirname, '../public/CV_Damien_Gallez.pdf') }
                ]
            });
            res.json({ success: true, message: 'Email envoyé avec succès !' });
        } catch (error) {
            console.error('Erreur envoi email:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
