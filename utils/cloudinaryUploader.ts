import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

const isConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

let warned = false;

export async function uploadToCloudinary(localPath: string): Promise<string> {
  if (!isConfigured) {
    if (!warned) {
      console.warn(
        '[cloudinary] CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET not set — screenshots will use local paths only. ' +
        'Add credentials to .env for cloud-hosted images.',
      );
      warned = true;
    }
    return '';
  }

  try {
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: 'image',
      folder: 'playwright-reports',
    });
    return result.secure_url;
  } catch (err) {
    console.warn(`[cloudinary] Failed to upload ${localPath}: ${(err as Error).message}`);
    return '';
  }
}
