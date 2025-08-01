import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  console.log('🚀 SIMPLE UPLOAD API CALLED');
  
  try {
    console.log('🔄 Processing image upload...');
    
    const formData = await request.formData();
    console.log('📋 FormData entries:', Array.from(formData.entries()).map(([key, value]) => [key, typeof value]));
    
    const imageFile = formData.get('image') as File;
    
    console.log('📋 Extracted data:', { 
      fileName: imageFile?.name, 
      fileSize: imageFile?.size,
      fileType: imageFile?.type,
      hasFile: !!imageFile
    });
    
    if (!imageFile) {
      console.log('❌ Missing image file');
      return NextResponse.json({ 
        success: false,
        error: 'Image file is required' 
      }, { status: 400 });
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: 'Only image files are allowed'
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File size must be less than 5MB'
      }, { status: 400 });
    }

    console.log('✅ Image validation passed');

    // Generate unique filename
    const fileExtension = imageFile.name.split('.').pop() || 'jpg';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
    
    // Save file to public/uploads
    const filePath = join(uploadsDir, uniqueFileName);
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);
    
    // Create public URL
    const imageUrl = `/uploads/${uniqueFileName}`;

    console.log('✅ File upload successful!');
    console.log('🔗 Image URL:', imageUrl);

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully!',
      imageUrl: imageUrl,
      imageKey: uniqueFileName,
      imageType: imageFile.type
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}