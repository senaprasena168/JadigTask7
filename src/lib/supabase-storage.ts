import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase S3-compatible client
const supabaseClient = new S3Client({
  region: 'us-east-1', // Supabase uses us-east-1 for S3 compatibility
  endpoint: process.env.SUPABASE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for Supabase S3 compatibility
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
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param folder - The folder path (e.g., 'products', 'users')
 * @param productId - Optional product ID for organizing files
 * @returns Upload result with URL and key
 */
export async function uploadImageToSupabase(
  file: File,
  folder: string = 'products',
  productId?: string | number
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Only image files are allowed',
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size must be less than 5MB',
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

    // Upload to Supabase Storage
    await supabaseClient.send(
      new PutObjectCommand({
        Bucket: process.env.SUPABASE_BUCKET_NAME!,
        Key: objectKey,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      })
    );

    // Construct public URL for Supabase Storage
    // Format: https://project-id.supabase.co/storage/v1/object/public/bucket-name/object-key
    const supabaseUrl = process.env.SUPABASE_ENDPOINT!.replace('/storage/v1/s3', '');
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/${objectKey}`;

    return {
      success: true,
      imageUrl,
      imageKey: objectKey,
    };
  } catch (error) {
    console.error('Supabase upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param imageKey - The Supabase object key to delete
 * @returns Delete result
 */
export async function deleteImageFromSupabase(
  imageKey: string
): Promise<DeleteResult> {
  try {
    if (!imageKey) {
      return {
        success: false,
        error: 'Image key is required',
      };
    }

    await supabaseClient.send(
      new DeleteObjectCommand({
        Bucket: process.env.SUPABASE_BUCKET_NAME!,
        Key: imageKey,
      })
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error('Supabase delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Get public URL for image access
 * @param imageKey - The Supabase object key
 * @returns The public URL
 */
export function getSupabaseImageUrl(imageKey: string): string {
  if (!imageKey) return '';
  const supabaseUrl = process.env.SUPABASE_ENDPOINT!.replace('/storage/v1/s3', '');
  return `${supabaseUrl}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/${imageKey}`;
}

/**
 * Extract image key from full Supabase URL
 * @param imageUrl - Full image URL
 * @returns The object key
 */
export function extractSupabaseImageKey(imageUrl: string): string {
  if (!imageUrl) return '';

  const supabaseUrl = process.env.SUPABASE_ENDPOINT!.replace('/storage/v1/s3', '');
  const publicUrlPattern = `${supabaseUrl}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/`;
  
  if (imageUrl.startsWith(publicUrlPattern)) {
    return imageUrl.replace(publicUrlPattern, '');
  }

  return '';
}

/**
 * Validate Supabase configuration
 * @returns True if all required environment variables are set
 */
export function validateSupabaseConfig(): boolean {
  const requiredEnvs = [
    'SUPABASE_ACCESS_KEY_ID',
    'SUPABASE_SECRET_ACCESS_KEY',
    'SUPABASE_BUCKET_NAME',
    'SUPABASE_ENDPOINT',
  ];

  return requiredEnvs.every((env) => process.env[env]);
}