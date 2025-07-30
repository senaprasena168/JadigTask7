import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert to base64 for text storage
    const base64Data = buffer.toString('base64');
    
    // Create temporary product record with image data using Prisma
    const result = await prisma.product.create({
      data: {
        name: 'temp',
        price: 0,
        description: 'temp',
        imageData: base64Data,
        imageType: file.type
      }
    });
    
    console.log('Upload - Created temp product:', result.id);
    
    return NextResponse.json({
      success: true,
      imageId: result.id,
      url: `/api/images/${result.id}`
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to upload image',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}



