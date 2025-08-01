import { NextRequest, NextResponse } from 'next/server';

// This endpoint is deprecated - use /api/products/upload-image-simple instead
export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: 'This endpoint is deprecated. Use /api/products/upload-image-simple instead.'
  }, { status: 410 });
}
