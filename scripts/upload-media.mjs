#!/usr/bin/env node
/**
 * scripts/upload-media.mjs
 *
 * 将 public/{images,videos,music} 下的媒体批量上传到 Cloudinary
 * 支持断点续传（跳过已存在资源）、并发控制
 *
 * 使用方式:
 *   node scripts/upload-media.mjs [--type=images|videos|music|all]
 *
 * 默认 --type=all，上传全部
 * 会从 .env 自动读取凭据（需先 npm install dotenv）
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 加载 .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=["']?(.+?)["']?\s*$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

if (!cloudinary.config().cloud_name || !cloudinary.config().api_key) {
  console.error('❌ Cloudinary 凭据未设置，请检查 .env 文件');
  process.exit(1);
}

const PUBLIC_DIR = path.join(__dirname, '../public');
const DATA_DIR = path.join(__dirname, '../src/data');

// 并发限制
const CONCURRENCY = 3;

// ─── 工具函数 ────────────────────────────────────────────────────────────────

function walkDir(dir, extensions) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, extensions));
    } else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

async function checkExists(publicId, resourceType) {
  try {
    const res = await cloudinary.api.resource(publicId, { resource_type: resourceType });
    return res.secure_url;
  } catch {
    return null;
  }
}

async function runWithConcurrency(tasks, concurrency) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

// ─── 上传函数 ────────────────────────────────────────────────────────────────

// 20MB 分片，适合视频/音频
const CHUNK_SIZE = 20 * 1024 * 1024;

async function uploadFile(filePath, publicId, resourceType) {
  // 先检查是否已存在
  const existingUrl = await checkExists(publicId, resourceType);
  if (existingUrl) {
    return { status: 'exists', url: existingUrl };
  }

  const stat = fs.statSync(filePath);
  const isLarge = stat.size > CHUNK_SIZE;

  const options = {
    public_id: publicId,
    resource_type: resourceType,
    overwrite: false,
    timeout: 120000, // 120s 超时
  };

  // 大文件用分片上传
  const result = isLarge
    ? await cloudinary.uploader.upload_large(filePath, { ...options, chunk_size: CHUNK_SIZE })
    : await cloudinary.uploader.upload(filePath, options);

  return { status: 'uploaded', url: result.secure_url };
}

// ─── 图片上传 ────────────────────────────────────────────────────────────────

async function uploadImages() {
  console.log('\n🖼️  开始上传图片...');
  const imagesDir = path.join(PUBLIC_DIR, 'images');
  const files = walkDir(imagesDir, ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
  console.log(`   找到 ${files.length} 张图片`);

  const mapping = {};
  let uploaded = 0, skipped = 0, failed = 0;

  const tasks = files.map(filePath => async () => {
    const filename = path.relative(imagesDir, filePath);
    const publicId = `ari-site/images/${filename.replace(/\\/g, '/').replace(/\.[^.]+$/, '')}`;
    try {
      const { status, url } = await uploadFile(filePath, publicId, 'image');
      mapping[path.basename(filename)] = url;
      if (status === 'exists') { skipped++; process.stdout.write('·'); }
      else { uploaded++; process.stdout.write('✓'); }
    } catch (err) {
      failed++;
      process.stdout.write('✗');
      console.error(`\n   ❌ 失败: ${filename} — ${err.message}`);
    }
  });

  await runWithConcurrency(tasks, CONCURRENCY);
  console.log(`\n   完成：上传 ${uploaded}，跳过 ${skipped}，失败 ${failed}`);
  return mapping;
}

// ─── 视频上传 ────────────────────────────────────────────────────────────────

async function uploadVideos() {
  console.log('\n🎬  开始上传视频...');
  const videosDir = path.join(PUBLIC_DIR, 'videos');
  const files = walkDir(videosDir, ['.mp4', '.webm', '.mov']);
  console.log(`   找到 ${files.length} 个视频`);

  const mapping = {};
  let uploaded = 0, skipped = 0, failed = 0;

  const tasks = files.map(filePath => async () => {
    const filename = path.basename(filePath);
    const nameNoExt = path.basename(filePath, path.extname(filePath));
    const publicId = `ari-site/videos/${nameNoExt}`;
    try {
      const { status, url } = await uploadFile(filePath, publicId, 'video');
      // 映射 key = 原始文件名（去掉扩展名）
      mapping[nameNoExt] = url;
      if (status === 'exists') { skipped++; process.stdout.write('·'); }
      else { uploaded++; process.stdout.write('✓'); }
    } catch (err) {
      failed++;
      process.stdout.write('✗');
      console.error(`\n   ❌ 失败: ${filename} — ${err.message}`);
    }
  });

  // 视频较大，降低并发
  await runWithConcurrency(tasks, 2);
  console.log(`\n   完成：上传 ${uploaded}，跳过 ${skipped}，失败 ${failed}`);
  return mapping;
}

// ─── 音频上传 ────────────────────────────────────────────────────────────────

async function uploadMusic() {
  console.log('\n🎵  开始上传音频...');
  const musicDir = path.join(PUBLIC_DIR, 'music');
  const files = walkDir(musicDir, ['.mp3', '.flac', '.m4a', '.wav', '.ogg']);
  console.log(`   找到 ${files.length} 首音乐`);

  // mapping: { "专辑目录/文件名": url }
  const mapping = {};
  let uploaded = 0, skipped = 0, failed = 0;

  const tasks = files.map(filePath => async () => {
    const relative = path.relative(musicDir, filePath).replace(/\\/g, '/');
    const publicId = `ari-site/music/${relative.replace(/\.[^.]+$/, '')}`;
    try {
      const { status, url } = await uploadFile(filePath, publicId, 'video'); // Cloudinary 用 video 类型处理音频
      mapping[relative] = url;
      if (status === 'exists') { skipped++; process.stdout.write('·'); }
      else { uploaded++; process.stdout.write('✓'); }
    } catch (err) {
      failed++;
      process.stdout.write('✗');
      console.error(`\n   ❌ 失败: ${relative} — ${err.message}`);
    }
  });

  // 音频文件多但小，并发3
  await runWithConcurrency(tasks, CONCURRENCY);
  console.log(`\n   完成：上传 ${uploaded}，跳过 ${skipped}，失败 ${failed}`);
  return mapping;
}

// ─── 写映射文件 ──────────────────────────────────────────────────────────────

function writeMapping(filename, varName, description, mapping) {
  const outPath = path.join(DATA_DIR, filename);
  const content = `// 自动生成 by scripts/upload-media.mjs — 请勿手动编辑
// ${description}
export const ${varName}: Record<string, string> = ${JSON.stringify(mapping, null, 2)};

/**
 * 获取 URL：优先 Cloudinary，回退本地
 */
export function get${varName.replace('CLOUDINARY_', '').replace(/_/g, '')}Url(key: string, fallbackDir = ''): string {
  return ${varName}[key] ?? (fallbackDir ? \`/\${fallbackDir}/\${key}\` : key);
}
`;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(outPath, content, 'utf-8');
  console.log(`   📄 映射文件写入: src/data/${filename} (${Object.keys(mapping).length} 条)`);
}

// ─── 主流程 ──────────────────────────────────────────────────────────────────

const type = process.argv.find(a => a.startsWith('--type='))?.split('=')[1] ?? 'all';

console.log(`\n🚀 Cloudinary 媒体上传脚本`);
console.log(`   Cloud: ${cloudinary.config().cloud_name}`);
console.log(`   类型: ${type}`);
console.log(`   并发: ${CONCURRENCY}`);

if (type === 'all' || type === 'images') {
  const imgMapping = await uploadImages();
  writeMapping('cloudinaryImages.ts', 'CLOUDINARY_IMAGES', 'Cloudinary 图片 URL 映射', imgMapping);
}

if (type === 'all' || type === 'videos') {
  const vidMapping = await uploadVideos();
  writeMapping('cloudinaryVideos.ts', 'CLOUDINARY_VIDEOS', 'Cloudinary 视频 URL 映射（key = 文件名不含扩展名）', vidMapping);
}

if (type === 'all' || type === 'music') {
  const musicMapping = await uploadMusic();
  writeMapping('cloudinaryMusic.ts', 'CLOUDINARY_MUSIC', 'Cloudinary 音频 URL 映射（key = 专辑目录/文件名）', musicMapping);
}

console.log('\n✅ 全部完成！\n');
