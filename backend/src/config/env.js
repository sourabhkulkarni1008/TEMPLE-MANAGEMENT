import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'smart_temple_default_jwt_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DATABASE_URL: process.env.DATABASE_URL || '',
  USE_LOCAL_STORAGE: process.env.USE_LOCAL_STORAGE !== 'false',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '"Smart Temple Administration" <no-reply@templedemo.com>',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  AI_DEMO_MODE: process.env.AI_DEMO_MODE !== 'false',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  TEMPLE_NAME: process.env.TEMPLE_NAME || 'Sri Siddhivinayak & Venkateswara Temple Complex',
  TEMPLE_LOCATION: process.env.TEMPLE_LOCATION || 'Hill Shrine Campus, Temple Road',
  TEMPLE_CONTACT_PHONE: process.env.TEMPLE_CONTACT_PHONE || '+91 98765 43210',
  TEMPLE_CONTACT_EMAIL: process.env.TEMPLE_CONTACT_EMAIL || 'support@templedemo.com'
};
