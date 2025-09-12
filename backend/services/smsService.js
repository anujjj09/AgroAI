const twilio = require('twilio');

class SMSService {
    constructor() {
        this.client = null;
        this.isConfigured = false;
        
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            this.isConfigured = true;
        } else {
            console.warn('⚠️ Twilio credentials not configured. SMS service will be simulated.');
        }
    }

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendOTP(phoneNumber, otp, purpose = 'verification') {
        const message = `Your AgroAI ${purpose} OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`;
        
        if (!this.isConfigured) {
            // Simulate SMS sending in development
            console.log(`📱 SMS Simulation - Phone: +91${phoneNumber}, OTP: ${otp}`);
            return {
                success: true,
                sid: 'simulated_' + Date.now(),
                message: 'OTP sent (simulated)'
            };
        }

        try {
            const result = await this.client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: `+91${phoneNumber}`
            });

            return {
                success: true,
                sid: result.sid,
                message: 'OTP sent successfully'
            };
        } catch (error) {
            console.error('SMS sending failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendAlert(phoneNumber, message) {
        if (!this.isConfigured) {
            console.log(`📱 Alert SMS Simulation - Phone: +91${phoneNumber}, Message: ${message}`);
            return { success: true, message: 'Alert sent (simulated)' };
        }

        try {
            const result = await this.client.messages.create({
                body: `AgroAI Alert: ${message}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: `+91${phoneNumber}`
            });

            return {
                success: true,
                sid: result.sid,
                message: 'Alert sent successfully'
            };
        } catch (error) {
            console.error('Alert SMS sending failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new SMSService();
