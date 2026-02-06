// Simulates an Alerting Gateway (Twilio/SendGrid)
// In production, this would use real APIs.

const listeners = [];

function registerSocket(socket) {
    listeners.push(socket);
}

function broadcast(type, payload) {
    listeners.forEach(socket => {
        socket.emit('alert-stream', {
            id: Date.now() + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toISOString(),
            type: type.toUpperCase(), // SMS, EMAIL, RADIO
            ...payload
        });
    });
}

function sendSMS(to, body) {
    console.log(`[SMS] To: ${to} | Body: ${body}`);
    broadcast('SMS', { recipient: to, message: body });
    return Promise.resolve({ success: true });
}

function sendEmail(to, subject, body) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    broadcast('EMAIL', { recipient: to, subject, message: body });
    return Promise.resolve({ success: true });
}

function sendRadioAlert(frequency, message) {
    console.log(`[RADIO] Freq: ${frequency} | Msg: ${message}`);
    broadcast('RADIO', { frequency, message });
    return Promise.resolve({ success: true });
}

module.exports = { registerSocket, sendSMS, sendEmail, sendRadioAlert };
