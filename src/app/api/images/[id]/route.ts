import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: {
        imageData: true,
        imageType: true
      }
    });
    
    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }
    
    if (product.imageData) {
      try {
        const imageBuffer = Buffer.from(product.imageData, 'base64');
        
        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': product.imageType || 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000',
          },
        });
      } catch (error) {
        console.error('Error processing image data:', error);
        return new NextResponse('Invalid image data', { status: 500 });
      }
    }
    
    return new NextResponse('No image data', { status: 404 });
    
  } catch (error) {
    console.error('Image API error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}








