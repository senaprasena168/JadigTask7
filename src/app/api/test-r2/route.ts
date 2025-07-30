import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';

export async function GET() {
  try {
    console.log('Testing Cloudflare R2 connection...');

    // Check environment variables
    const requiredEnvs = [
      'CLOUDFLARE_R2_ACCESS_KEY_ID',
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY', 
      'CLOUDFLARE_R2_BUCKET_NAME',
      'CLOUDFLARE_R2_ENDPOINT'
    ];

    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
    
    if (missingEnvs.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing environment variables: ${missingEnvs.join(', ')}`
      }, { status: 500 });
    }

    // Initialize R2 client
    const R2 = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });

    // Test connection by listing objects
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      MaxKeys: 5
    });

    const listResult = await R2.send(listCommand);

    // Test upload
    const testContent = `Test upload at ${new Date().toISOString()}`;
    const testKey = `test/api-test-${Date.now()}.txt`;

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });

    await R2.send(uploadCommand);

    const publicUrl = `${process.env.CLOUDFLARE_R2_ENDPOINT}/${testKey}`;

    return NextResponse.json({
      success: true,
      message: 'Cloudflare R2 connection successful',
      bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      objectCount: listResult.KeyCount || 0,
      testUpload: {
        key: testKey,
        url: publicUrl
      }
    });

  } catch (error) {
    console.error('R2 test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check server logs for more information'
    }, { status: 500 });
  }
}