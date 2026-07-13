// ===================================================================
// MESSAGE QUEUE IMPLEMENTATION
// Custom Asynchronous Queue for background tasks (e.g., Email/SMS Alerts)
// ===================================================================

const twilio = require('twilio');
const nodemailer = require('nodemailer');

// --- 1. Twilio Setup (Safe Fallback if missing env vars) ---
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;


// --- 2. MailHog Setup  ---
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

class AlertQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        
        this.cooldowns = new Map(); 
        this.COOLDOWN_PERIOD = 60 * 60 * 1000;
    }

    addJob(jobData) {
        const now = Date.now();
        const lastAlertTime = this.cooldowns.get(jobData.city) || 0;

        if (now - lastAlertTime < this.COOLDOWN_PERIOD) {
            console.log(`[Queue Anti-Spam] Alert skipped for ${jobData.city}. Cooldown active.`);
            return; 
        }

        this.queue.push(jobData);
        this.cooldowns.set(jobData.city, now);
        console.log(`[Queue Producer] Job added: ${jobData.alertType} alert for ${jobData.city}`);
        
        this.processQueue();
    }

    // CONSUMER / BACKGROUND WORKER: Processes jobs asynchronously
    async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const currentJob = this.queue.shift(); 
            
            console.log(`[Queue Worker] Processing background task: Sending ${currentJob.alertType} to users in ${currentJob.city}...`);
            
            try {
                const messageBody = `🚨 WEATHER ALERT: ${currentJob.alertType} detected in ${currentJob.city}! Please stay safe.`;

                // --- SEND SMS VIA TWILIO ---
                if (twilioClient && process.env.TWILIO_PHONE_NUMBER && process.env.USER_PHONE_NUMBER) {
                    await twilioClient.messages.create({
                        body: messageBody,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: process.env.USER_PHONE_NUMBER
                    });
                    console.log(`[Twilio] SMS sent successfully to ${process.env.USER_PHONE_NUMBER}`);
                }

                // --- SEND EMAIL VIA MAILHOG ---
                
                // 🛑 Purana Basic Code (Safe rakha gaya hai, delete nahi kiya)
                /*
                await transporter.sendMail({
                    from: '"Weather System" <alerts@weatherapp.com>',
                    to: "user@example.com",
                    subject: `Weather Alert: ${currentJob.city}`,
                    text: messageBody
                });
                */

                await transporter.sendMail({
                    from: `"Weather Forecast Alerts" <${process.env.SMTP_USER || 'alerts@weatherapp.com'}>`,
                    to: currentJob.userEmail || "user@example.com", 
                    subject: `⚠️ Severe Weather Alert for ${currentJob.city}`,
                    text: messageBody, 
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                            <div style="background-color: #1e3a8a; padding: 20px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0;">⛅ Weather Forecast System</h1>
                            </div>
                            <div style="padding: 30px; background-color: #f8fafc; color: #1e293b;">
                                <h2 style="color: #ef4444; margin-top: 0;">Weather Alert!</h2>
                                <p style="font-size: 16px; line-height: 1.6;">
                                    Hello,<br><br>
                                    ${currentJob.alertType}
                                </p>
                                <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-top: 20px;">
                                    <strong>City:</strong> ${currentJob.city} <br>
                                </div>
                                <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
                                    You are receiving this email because you turned on Email Alerts in your Weather Forecast settings.
                                </p>
                            </div>
                        </div>
                    `
                });

                console.log(`[MailHog/SMTP] Email sent successfully for ${currentJob.city} to ${currentJob.userEmail || "user@example.com"}`);

            } catch (error) {
                
                console.error(`[Queue Worker Error] Failed to send alert:`, error.message);
            }
            
            console.log(`[Queue Worker] ✅ Task completed for ${currentJob.city}`);
        }

        this.isProcessing = false;
        console.log(`[Queue Manager] All background alerts processed. Queue is empty.`);
    }
}
const alertQueue = new AlertQueue();
module.exports = alertQueue;