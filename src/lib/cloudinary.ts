import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * 生成客户端上传签名（让前端直接上传到 Cloudinary，不经过服务端中转大文件）
 */
export function generateUploadSignature(folder = 'ari-site') {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );
  return { timestamp, signature, folder, apiKey: process.env.CLOUDINARY_API_KEY! };
}
