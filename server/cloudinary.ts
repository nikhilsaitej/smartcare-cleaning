import { v2 as cloudinary } from 'cloudinary';
import { auditLog } from './security/auditLogger';

// Configure using the CLOUDINARY_URL environment variable if it exists,
// otherwise use individual components.
if (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.includes('<your_api_key>')) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
    secure: true
  });
} else {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary credentials not configured. Image uploads will be disabled.');
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export const getCloudinarySignature = (folder: string = 'smartcare') => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Get credentials for the response
  const config = cloudinary.config();
  
  if (!config.api_secret) {
    throw new Error('Cloudinary API Secret is not configured');
  }

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET || ''
  );

  return {
    timestamp,
    signature,
    apiKey: config.api_key,
    cloudName: config.cloud_name,
    folder
  };
};

export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    auditLog('INFO', { action: 'IMAGE_DELETED', publicId, result });
    return result;
  } catch (error) {
    auditLog('WARNING', { action: 'IMAGE_DELETE_ERROR', publicId, error: String(error) });
    throw error;
  }
};

export default cloudinary;
