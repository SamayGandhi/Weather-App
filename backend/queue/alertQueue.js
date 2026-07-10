// ===================================================================
// MESSAGE QUEUE IMPLEMENTATION
// Custom Asynchronous Queue for background tasks (e.g., Email/SMS Alerts)
// ===================================================================

class AlertQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    // PRODUCER: Pushes a new job into the queue
    addJob(jobData) {
        this.queue.push(jobData);
        console.log(`[Queue Producer] Job added: ${jobData.alertType} alert for ${jobData.city}`);
        
        // Trigger the background worker if it's not already running
        this.processQueue();
    }

    // CONSUMER / BACKGROUND WORKER: Processes jobs asynchronously
    async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const currentJob = this.queue.shift(); // Dequeue the first job
            
            console.log(`[Queue Worker] Processing background task: Sending ${currentJob.alertType} to users in ${currentJob.city}...`);
            
            // Simulate a time-consuming background task (like sending Twilio SMS or MailHog Email)
            // We use a Promise to wait for 2 seconds without blocking other API requests
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log(`[Queue Worker] ✅ Task completed for ${currentJob.city}`);
        }

        this.isProcessing = false;
        console.log(`[Queue Manager] All background alerts processed. Queue is empty.`);
    }
}

// Export a single instance to be used across the application
const alertQueue = new AlertQueue();
module.exports = alertQueue;