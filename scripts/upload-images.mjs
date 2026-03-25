#!/usr/bin/env node
/**
 * scripts/upload-images.mjs
 * 
 * 将 public/images/ 下的图片批量上传到 Cloudinary
 * 
 * 使用方式:
 *   CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=yyy CLOUDINARY_API_SECRET=zzz node scripts/upload-images.mjs
 * 
 * 上传后输出一份 src/data/cloudinaryImages.ts 映射文件
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '../public/images');
const OUTPUT_FILE = path.join(__dirname, '../src/data/cloudinaryImages.ts');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

async function uploadImages() {
  if (!cloudinary.config().cloud_name) {
    console.error('❌ 请设置 CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET 环境变量');
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR).filter(f =>
    IMAGE_EXTENSIONS.includes(path.extname(f).toLowerCase())
  );

  console.log(`📁 找到 ${files.length} 张图片，开始上传...\n`);
  const mapping = {};

  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const publicId = `ari-site/images/${path.basename(file, path.extname(file))}`;

    try {
      // 检查是否已存在（避免重复上传）
      const existing = await cloudinary.api.resource(publicId).catch(() => null);
      if (existing) {
        console.log(`  ✓ 已存在: ${file}`);
        mapping[file] = existing.secure_url;
        continue;
      }

      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: false,
        resource_type: 'image',
      });
      mapping[file] = result.secure_url;
      console.log(`  ✅ 上传成功: ${file} → ${result.secure_url}`);
    } catch (err) {
      console.error(`  ❌ 上传失败: ${file}`, err.message);
    }
  }

  // 生成 TypeScript 映射文件
  const ts = `// 自动生成 by scripts/upload-images.mjs — 请勿手动编辑
// Cloudinary 图片 URL 映射，用于替换 /images/ 本地路径
export const CLOUDINARY_IMAGES: Record<string, string> = ${JSON.stringify(mapping, null, 2)};

/**
 * 获取图片 URL：优先使用 Cloudinary，回退到本地 /images/
 */
export function getImageUrl(filename: string): string {
  return CLOUDINARY_IMAGES[filename] ?? \`/images/\${filename}\`;
}
`;

  fs.writeFileSync(OUTPUT_FILE, ts, 'utf-8');
  console.log(`\n📄 映射文件已写入: ${OUTPUT_FILE}`);
  console.log(`✅ 完成！共上传 ${Object.keys(mapping).length} 张图片`);
}

uploadImages().catch(console.error);
