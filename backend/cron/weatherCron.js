const cron = require('node-cron');
const axios = require('axios');
const User = require('../models/User'); 
const Favorite = require('../models/Favorite');
const alertQueue = require('../queue/alertQueue');

//  NORMALLY: '0 */3 * * *' (3 hour)
//  TESTING : '* * * * *' (1 minute)
cron.schedule('0 */3 * * *', async () => {
    console.log('[CRON JOB] Starting background weather check for favorite cities...');
    
    try {
        const users = await User.find({
            $or: [
                { emailAlerts: true },
                { smsAlerts: true }
            ]
        });

        if (!users || users.length === 0) {
            console.log('[CRON JOB] No users with active alerts found. Skipping.');
            return;
        }

        for (const user of users) {
            
            const userFavorites = await Favorite.find({ userId: user._id });

            if (!userFavorites || userFavorites.length === 0) {
                continue;
            }

            for (const favorite of userFavorites) {
                const cityName = favorite.cityName; 

                try {
                    const apiKey = process.env.WEATHER_API_KEY;
                    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
                    const response = await axios.get(url);
                    
                    const condition = response.data.weather[0].main.toLowerCase();

                    if (condition === 'rain' || condition === 'thunderstorm' || condition === 'extreme') {
                        
                        console.log(`[CRON ALERT] Weather (${condition}) detected in ${cityName} for user ${user.email}`);
                        
                        alertQueue.addJob({
                            alertType: `Alert! Current weather in your favorite city (${cityName}) is ${condition}.`,
                            city: cityName,
                            userEmail: user.email, 
                            userPhone: user.phone, 
                            sendEmail: user.emailAlerts,
                            sendSms: user.smsAlerts
                        });
                    }
                } catch (apiErr) {
                    console.error(`[CRON ERROR] Failed to fetch weather for ${cityName}`);
                }
            }
        }
        console.log('[CRON JOB] Background weather check cycle completed.');
    } catch (error) {
        console.error('[CRON JOB ERROR]', error);
    }
});