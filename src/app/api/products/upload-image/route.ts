import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadImageToR2, validateR2Config } from '@/lib/r2-storage';

export async function POST(request: NextRequest) {
  console.log('🚀 UPLOAD API CALLED');
  
  try {
    // Validate R2 configuration
    if (!validateR2Config()) {
      console.log('❌ R2 configuration missing');
      return NextResponse.json({ 
        success: false,
        error: 'R2 storage configuration is incomplete' 
      }, { status: 500 });
    }

    console.log('🔄 Processing image upload...');
    
    const formData = await request.formData();
    console.log('📋 FormData entries:', Array.from(formData.entries()).map(([key, value]) => [key, typeof value]));
    
    const productId = formData.get('productId') as string;
    const imageFile = formData.get('image') as File;
    
    console.log('📋 Extracted data:', { 
      productId, 
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

    console.log('✅ Image validation passed');

    // Upload to R2 using our utility
    const uploadResult = await uploadImageToR2(imageFile, 'products', productId);
    
    if (!uploadResult.success) {
      console.log('❌ R2 upload failed:', uploadResult.error);
      return NextResponse.json({ 
        success: false,
        error: uploadResult.error 
      }, { status: 500 });
    }

    console.log('✅ R2 upload successful!');
    console.log('🔗 Image URL:', uploadResult.imageUrl);
    console.log('🔑 Image Key:', uploadResult.imageKey);

    // Update database if productId exists (for existing products)
    if (productId) {
      try {
        await prisma.product.update({
          where: { id: parseInt(productId) },
          data: {
            imageUrl: uploadResult.imageUrl,
            imageKey: uploadResult.imageKey,
            imageType: imageFile.type,
            updatedAt: new Date()
          }
        });
        console.log('✅ Database updated successfully!');
      } catch (dbError) {
        console.error('❌ Database update failed:', dbError);
        // Don't fail the request if DB update fails, image is already uploaded
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully!',
      imageUrl: uploadResult.imageUrl,
      imageKey: uploadResult.imageKey,
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
