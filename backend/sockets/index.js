// --- 5. WEBSOCKETS LOGIC  ---
const setupSockets = (io) => {
    io.on('connection', (socket) => {
        console.log(`Frontend Connected to WebSockets: ${socket.id}`);
        
        // Simulate a real-time push notification every 10 seconds
        setInterval(() => {
            socket.emit('weatherAlert', {
                message: "🚨 Real-Time Alert: Sudden cloud cover and heavy rainfall expected!"
            });
        }, 10000);

        socket.on('disconnect', () => console.log('Frontend Disconnected'));
    });
};

module.exports = setupSockets;