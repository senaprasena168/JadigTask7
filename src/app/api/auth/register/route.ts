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
      pass: process.env.EMAIL_APP_PASSWORD || 'placeholder-password', // Will be replaced with actual app password
    },
    tls: {
      rejectUnauthorized: false,
    },
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

    // Check if user already exists in auth_users table
    const existingUser = await prisma.authUser.findUnique({
      where: { email: email }
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
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create user with unverified status and OTP in auth_users table
    const newUser = await prisma.authUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        isAdmin: email === 'aingmeongshop@gmail.com', // Only specific email gets admin
        provider: 'email',
        otpCode,
        otpExpiry
      }
    });

    // Send OTP email
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: 'aingmeongshop@gmail.com',
        to: email,
        subject: 'Verify Your Aing Meong Shop Account - OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center;">Welcome to Aing Meong Shop!/h2>
            <p>Hello ${name},</p>
            <p>Thank you for registering with us. To complete your registration, please verify your email address using the OTP code below:</p>
            
            <div style="background: #f8f9fa; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 4px;">${otpCode}</h1>
              <p style="color: #666; margin: 10px 0 0 0;">This code will expire in 10 minutes</p>
            </div>
            
            <p><strong>Important:</strong> Please enter this code in the verification form to activate your account.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              This is an automated email from Aing Meong Shop. Please do not reply to this email.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      return NextResponse.json(
        {
          message:
            'Registration successful! Please check your email for the OTP verification code.',
          userId: newUser.id,
          email: newUser.email,
          requiresOTP: true,
        },
        { status: 201 }
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);

      // If email fails, delete the user and return error
      await prisma.authUser.delete({
        where: { id: newUser.id }
      });

      return NextResponse.json(
        {
          error: 'Failed to send verification email. Please try again.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
