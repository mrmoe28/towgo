import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { storage } from '../storage';
import { User } from '@shared/schema';

// Create a testing account if no SMTP credentials are provided
let transporter: nodemailer.Transporter;

// Initialize email transporter
async function initTransporter() {
  // If we have SMTP settings in the environment variables, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // Otherwise, use Ethereal for testing (https://ethereal.email/)
  const testAccount = await nodemailer.createTestAccount();
  console.log('Created test email account:', testAccount.user);
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

// Initialize the transporter
(async () => {
  try {
    transporter = await initTransporter();
    console.log('Email transporter initialized');
  } catch (error) {
    console.error('Failed to initialize email transporter:', error);
  }
})();

// Generate a verification token
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate verification token and save it to the database
export async function generateVerificationToken(userId: number): Promise<string> {
  const token = generateToken();
  
  // Token expires in 24 hours
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + 24);
  
  // Update user with token and expiration
  await storage.updateUserVerificationToken(userId, token, tokenExpires);
  
  return token;
}

// Generate reset password token and save it to the database
export async function generateResetPasswordToken(userId: number): Promise<string> {
  const token = generateToken();
  
  // Token expires in 1 hour
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + 1);
  
  // Update user with token and expiration
  await storage.updateUserResetPasswordToken(userId, token, tokenExpires);
  
  return token;
}

// Send verification email
export async function sendVerificationEmail(user: User, verificationUrl: string): Promise<boolean> {
  if (!user.email) {
    console.error('Cannot send verification email: User has no email address');
    return false;
  }

  if (!transporter) {
    console.error('Email transporter not initialized');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"TowGo" <noreply@towgo.com>',
      to: user.email,
      subject: 'Verify your TowGo account',
      text: `Hello ${user.displayName || user.username},\n\nPlease verify your email address by clicking the following link:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nThank you,\nThe TowGo Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to TowGo!</h2>
          <p>Hello ${user.displayName || user.username},</p>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #6B7280;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Thank you,<br>The TowGo Team</p>
        </div>
      `,
    });

    console.log('Verification email sent:', info.messageId);
    
    // For test accounts, show the preview URL
    if (info.messageId && info.messageId.includes('ethereal.email')) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(user: User, resetUrl: string): Promise<boolean> {
  if (!user.email) {
    console.error('Cannot send reset email: User has no email address');
    return false;
  }

  if (!transporter) {
    console.error('Email transporter not initialized');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"TowGo" <noreply@towgo.com>',
      to: user.email,
      subject: 'Reset your TowGo password',
      text: `Hello ${user.displayName || user.username},\n\nYou requested a password reset. Please click the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nThank you,\nThe TowGo Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>Hello ${user.displayName || user.username},</p>
          <p>You requested a password reset. Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #6B7280;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Thank you,<br>The TowGo Team</p>
        </div>
      `,
    });

    console.log('Password reset email sent:', info.messageId);
    
    // For test accounts, show the preview URL
    if (info.messageId && info.messageId.includes('ethereal.email')) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}