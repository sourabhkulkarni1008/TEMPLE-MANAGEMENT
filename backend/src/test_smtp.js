import nodemailer from 'nodemailer';
import { ENV } from './config/env.js';

console.log('========================================================');
console.log('🔍 TESTING GMAIL SMTP CONFIGURATION');
console.log('========================================================\n');

if (!ENV.EMAIL_USER || !ENV.EMAIL_PASSWORD || ENV.EMAIL_USER.includes('your_email')) {
  console.log('❌ Gmail credentials are NOT yet configured in backend/.env!');
  console.log('   Please set:');
  console.log('   EMAIL_USER=your_gmail@gmail.com');
  console.log('   EMAIL_PASSWORD=your_16_char_google_app_password\n');
  process.exit(1);
}

console.log(`📧 User: ${ENV.EMAIL_USER}`);
console.log(`🔑 Password length: ${ENV.EMAIL_PASSWORD.replace(/\s+/g, '').length} characters\n`);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASSWORD.replace(/\s+/g, '')
  }
});

console.log('Connecting to Gmail SMTP servers...');
transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ GMAIL SMTP VERIFICATION FAILED:');
    console.error(error.message);
    console.log('\n💡 Tip: Make sure you use a 16-character Google "App Password", NOT your personal Google account password.');
    console.log('   Visit: https://myaccount.google.com/apppasswords');
  } else {
    console.log('\n✅ GMAIL SMTP IS READY TO SEND LIVE EMAILS TO ALL PILGRIMS!');
    console.log('   Connection verified successfully.\n');
  }
});
