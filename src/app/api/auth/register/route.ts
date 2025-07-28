import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create email transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'aingmeongshop@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD || 'placeholder-password' // Will be replaced with actual app password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create user with admin role
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiry,
        isVerified: false,
        role: 'admin'
      }
    });

    // Send OTP email
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: 'aingmeongshop@gmail.com',
        to: email,
        subject: 'Verify Your Account - OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Cat Food Store!</h2>
            <p>Hello ${name},</p>
            <p>Thank you for registering with us. Please use the following OTP code to verify your account:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't create this account, please ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              This is an automated email from Cat Food Store. Please do not reply to this email.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      
      return NextResponse.json({
        message: 'User registered successfully. Please check your email for OTP verification.',
        userId: newUser.id
      }, { status: 201 });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // If email fails, still return success but with a different message
      return NextResponse.json({
        message: 'User registered successfully, but email sending failed. Please contact support.',
        userId: newUser.id,
        emailError: true
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}