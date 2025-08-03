import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
      pass: process.env.EMAIL_APP_PASSWORD || 'placeholder-password'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email in auth_users table
    const user = await prisma.authUser.findUnique({
      where: { email: email },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: 'User is already verified' },
        { status: 400 }
      );
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update user with new OTP in auth_users table
    await prisma.authUser.update({
      where: { id: user.id },
      data: {
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
        subject: 'Your New OTP Code - Aing Meong Shop',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center;">New OTP Code</h2>
            <p>Hello ${user.name},</p>
            <p>Here is your new OTP verification code:</p>
            
            <div style="background: #f8f9fa; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 4px;">${otpCode}</h1>
              <p style="color: #666; margin: 10px 0 0 0;">This code will expire in 10 minutes</p>
            </div>
            
            <p><strong>Important:</strong> Please enter this code in the verification form to activate your account.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              This is an automated email from Aing Meong Shop. Please do not reply to this email.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      
      return NextResponse.json({
        message: 'New OTP code sent to your email successfully!'
      }, { status: 200 });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      return NextResponse.json({
        error: 'Failed to send OTP email. Please try again.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error while sending OTP' },
      { status: 500 }
    );
  }
}