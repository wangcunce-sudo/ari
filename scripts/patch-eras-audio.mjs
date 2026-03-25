#!/usr/bin/env node
/**
 * scripts/patch-eras-audio.mjs
 * 
 * 把 src/data/eras.ts 里所有 audioSrc 的本地路径替换成 Cloudinary URL
 * 
 * 策略：按曲目 title 关键字模糊匹配 Cloudinary 音频文件名
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 读取 Cloudinary 音乐映射
const musicMapPath = path.join(__dirname, '../src/data/cloudinaryMusic.ts');
const musicMapContent = fs.readFileSync(musicMapPath, 'utf-8');
const musicMapMatch = musicMapContent.match(/export const CLOUDINARY_MUSIC[^=]+=\s*(\{[\s\S]+?\});/);
if (!musicMapMatch) { console.error('❌ 无法解析 cloudinaryMusic.ts'); process.exit(1); }

// 解析映射对象
const MUSIC_MAP = JSON.parse(musicMapMatch[1].replace(/,\s*\}/g, '}'));
console.log(`✅ 加载 ${Object.keys(MUSIC_MAP).length} 首 Cloudinary 音频`);

// 读取 eras.ts
const erasPath = path.join(__dirname, '../src/data/eras.ts');
let erasContent = fs.readFileSync(erasPath, 'utf-8');

// 按文件名（去掉 "Ariana Grande-" 前缀和扩展名）建索引，方便查找
// key: 曲名小写（无标点） => Cloudinary URL
const searchIndex = {};
for (const [relPath, url] of Object.entries(MUSIC_MAP)) {
  const filename = path.basename(relPath); // e.g. "Ariana Grande-Honeymoon Avenue.mp3"
  const title = filename
    .replace(/^Ariana Grande[-\s]+/i, '')     // 去掉艺人名前缀
    .replace(/\s*\(Explicit\)/gi, '')          // 去掉 (Explicit)
    .replace(/\s*\(Bonus Track\)/gi, '')       // 去掉 (Bonus Track)
    .replace(/\.[^.]+$/, '')                   // 去掉扩展名
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');               // 只保留字母数字
  searchIndex[title] = url;
}

// 替换每个 audioSrc
let replaced = 0, failed = 0;
const failedList = [];

erasContent = erasContent.replace(
  /audioSrc:\s*(["'`])([^"'`]+)\1/g,
  (match, quote, src) => {
    // 从 src 里提取曲名关键字
    const basename = path.basename(src, path.extname(src));
    // 去掉常见前缀如 "01_Ariana Grande - Yours Truly p01 "
    const cleanTitle = basename
      .replace(/^\d+_/, '')                          // 去数字前缀
      .replace(/Ariana Grande\s*[-—]\s*/gi, '')       // 去艺人名
      .replace(/Yours Truly\s*p\d+\s*/gi, '')         // 去专辑前缀
      .replace(/My Everything\s*p\d+\s*/gi, '')
      .replace(/Dangerous Woman\s*p\d+\s*/gi, '')
      .replace(/Sweetener\s*p\d+\s*/gi, '')
      .replace(/thank\s*u\s*next\s*p\d+\s*/gi, '')
      .replace(/Positions\s*p\d+\s*/gi, '')
      .replace(/eternal\s*sunshine\s*p\d+\s*/gi, '')
      .replace(/音乐纯享[^p]*p\d+\s*/g, '')           // 去中文说明
      .replace(/\s*\(Explicit\)/gi, '')
      .replace(/\s*\(Bonus Track\)/gi, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    // 精确匹配
    if (searchIndex[cleanTitle]) {
      replaced++;
      return `audioSrc: "${searchIndex[cleanTitle]}"`;
    }

    // 模糊匹配（cleanTitle 包含在 key 里或 key 包含在 cleanTitle 里）
    const fuzzyKey = Object.keys(searchIndex).find(k =>
      k.includes(cleanTitle.slice(0, 8)) || cleanTitle.includes(k.slice(0, 8))
    );
    if (fuzzyKey) {
      replaced++;
      return `audioSrc: "${searchIndex[fuzzyKey]}"`;
    }

    failed++;
    failedList.push({ src, cleanTitle });
    return match; // 保留原值
  }
);

if (failedList.length > 0) {
  console.log(`\n⚠️  ${failed} 首未匹配：`);
  failedList.forEach(({ src, cleanTitle }) =>
    console.log(`   [${cleanTitle}] ← ${path.basename(src, path.extname(src)).slice(0, 60)}`)
  );
}

// 写回文件
fs.writeFileSync(erasPath, erasContent, 'utf-8');
console.log(`\n✅ 完成：替换 ${replaced} 首，失败 ${failed} 首`);
console.log(`📄 已更新: src/data/eras.ts`);
