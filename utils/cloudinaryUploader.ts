import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(localPath: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: 'auto',
      folder: 'playwright-reports',
    });
    return result.secure_url;
  } catch (err) {
    console.warn(`[cloudinary] Failed to upload ${localPath}: ${(err as Error).message}`);
    return '';
  }
}
