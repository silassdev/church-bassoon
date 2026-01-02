import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const configs = [
    { host: 'smtp.gmail.com', port: 587, secure: false, label: 'Gmail 587 (TLS)' },
    { host: 'smtp.gmail.com', port: 465, secure: true, label: 'Gmail 465 (SSL)' }
];

async function testConfig(config) {
    console.log(`\n--- Testing ${config.label} ---`);
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
    });

    try {
        await transporter.verify();
        console.log(`✅ ${config.label} Connection successful!`);
        return true;
    } catch (error) {
        console.error(`❌ ${config.label} failed:`, error.message);
        return false;
    }
}

async function runTests() {
    console.log('User:', process.env.SMTP_USER);
    for (const config of configs) {
        const success = await testConfig(config);
        if (success) {
            console.log(`\nSuggestion: Update your .env to use port ${config.port} and SMTP_HOST=${config.host}`);
            break;
        }
    }
}

runTests();
