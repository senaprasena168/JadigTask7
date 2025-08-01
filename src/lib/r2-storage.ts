import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  imageKey?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Upload an image file to Cloudflare R2
 * @param file - The image file to upload
 * @param folder - The folder path (e.g., 'products', 'users')
 * @param productId - Optional product ID for organizing files
 * @returns Upload result with URL and key
 */
export async function uploadImageToR2(
  file: File,
  folder: string = 'products',
  productId?: string | number
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Only image files are allowed'
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size must be less than 5MB'
      };
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    
    // Create object key with folder structure
    const objectKey = productId 
      ? `${folder}/${productId}/${uniqueFileName}`
      : `${folder}/${uniqueFileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    await r2Client.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: objectKey,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      }
    }));

    // Construct public URL using the public base URL if available
    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL || process.env.CLOUDFLARE_R2_ENDPOINT;
    const imageUrl = `${publicBaseUrl}/${objectKey}`;

    return {
      success: true,
      imageUrl,
      imageKey: objectKey
    };

  } catch (error) {
    console.error('R2 upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Delete an image from Cloudflare R2
 * @param imageKey - The R2 object key to delete
 * @returns Delete result
 */
export async function deleteImageFromR2(imageKey: string): Promise<DeleteResult> {
  try {
    if (!imageKey) {
      return {
        success: false,
        error: 'Image key is required'
      };
    }

    await r2Client.send(new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: imageKey,
    }));

    return {
      success: true
    };

  } catch (error) {
    console.error('R2 delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
}

/**
 * Get a signed URL for private image access (if needed)
 * @param imageKey - The R2 object key
 * @returns The public URL (R2 bucket is public, so no signing needed)
 */
export function getImageUrl(imageKey: string): string {
  if (!imageKey) return '';
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL || process.env.CLOUDFLARE_R2_ENDPOINT;
  return `${publicBaseUrl}/${imageKey}`;
}

/**
 * Extract image key from full URL
 * @param imageUrl - Full image URL
 * @returns The object key
 */
export function extractImageKey(imageUrl: string): string {
  if (!imageUrl) return '';
  
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL || process.env.CLOUDFLARE_R2_ENDPOINT;
  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
  
  if (publicBaseUrl && imageUrl.startsWith(publicBaseUrl)) {
    return imageUrl.replace(`${publicBaseUrl}/`, '');
  } else if (endpoint && imageUrl.startsWith(endpoint)) {
    return imageUrl.replace(`${endpoint}/`, '');
  }
  
  return '';
}

/**
 * Validate R2 configuration
 * @returns True if all required environment variables are set
 */
export function validateR2Config(): boolean {
  const requiredEnvs = [
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_BUCKET_NAME',
    'CLOUDFLARE_R2_ENDPOINT'
  ];

  return requiredEnvs.every(env => process.env[env]);
}