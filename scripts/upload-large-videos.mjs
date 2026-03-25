#!/usr/bin/env node
/**
 * 单独上传2个100MB+大视频到 Cloudinary
 * 在终端运行: node scripts/upload-large-videos.mjs
 */
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const m = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const VIDEOS_DIR = path.join(__dirname, '../public/videos');

function uploadLarge(filePath, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      filePath,
      {
        public_id: publicId,
        resource_type: 'video',
        overwrite: true,
        chunk_size: 50 * 1024 * 1024, // 50MB 分片
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}

const targets = [
  'eternal_sunshine_wecantbefriends',
  'eternal_sunshine_theboyismine',
];

// 更新映射文件
const mapPath = path.join(__dirname, '../src/data/cloudinaryVideos.ts');
const mapContent = fs.readFileSync(mapPath, 'utf-8');
const mapObj = JSON.parse(mapContent.match(/=\s*(\{[\s\S]+?\});/)[1].replace(/,\s*\}/g, '}'));

for (const name of targets) {
  const filePath = path.join(VIDEOS_DIR, `${name}.mp4`);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  文件不存在: ${name}.mp4`);
    continue;
  }
  const size = fs.statSync(filePath).size;
  console.log(`\n⬆️  上传 ${name}.mp4 (${(size / 1024 / 1024).toFixed(0)}MB)...`);
  console.log('   预计需要 2-5 分钟，请耐心等待...');

  try {
    const res = await uploadLarge(filePath, `ari-site/videos/${name}`);
    mapObj[name] = res.secure_url;
    console.log(`✅ 成功: ${res.secure_url}`);
  } catch (e) {
    console.log(`❌ 失败: ${e.message}`);
  }
}

// 写回映射文件
const newMap = `// 自动生成 by scripts/upload-media.mjs — 请勿手动编辑
// Cloudinary 视频 URL 映射（key = 文件名不含扩展名）
export const CLOUDINARY_VIDEOS: Record<string, string> = ${JSON.stringify(mapObj, null, 2)};

/**
 * 获取 URL：优先 Cloudinary，回退本地
 */
export function getVIDEOSUrl(key: string, fallbackDir = ''): string {
  return CLOUDINARY_VIDEOS[key] ?? (fallbackDir ? \`/\${fallbackDir}/\${key}\` : key);
}
`;
fs.writeFileSync(mapPath, newMap, 'utf-8');
console.log('\n📄 cloudinaryVideos.ts 已更新');
console.log('✅ 完成！');
