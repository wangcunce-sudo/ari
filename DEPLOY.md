# Vercel 部署指南

## 1. 前置条件

- [x] Neon Postgres 数据库已创建，`DATABASE_URL` 已获取
- [x] Cloudinary 账号已注册，`cloud_name / api_key / api_secret` 已获取
- [x] Vercel 账号已注册

---

## 2. 上传图片到 Cloudinary（可选，但推荐）

本地 `public/images/` 约 60MB，上传 Cloudinary 后 Git 仓库更干净：

```bash
cd ari-next
CLOUDINARY_CLOUD_NAME=你的cloud_name \
CLOUDINARY_API_KEY=你的api_key \
CLOUDINARY_API_SECRET=你的api_secret \
node scripts/upload-images.mjs
```

脚本会生成 `src/data/cloudinaryImages.ts`，前端可以通过 `getImageUrl(filename)` 获取 URL（自动回退到本地）。

> 音乐和视频文件（2.2GB）不上传 Cloudinary（免费层限 25GB 且视频按流量计费），已通过 `.gitignore` 排除。Era 页面的音频播放器在 Vercel 部署后将降级为无音频模式（页面 UI 正常，播放键不会播放）。

---

## 3. 推送代码到 GitHub

```bash
cd ari-next

# 如果没有 git 初始化
git init
git add .
git commit -m "feat: full-stack with Neon Postgres, Prisma, JWT auth"

# 在 GitHub 创建新仓库后
git remote add origin https://github.com/你的用户名/ari-next.git
git push -u origin main
```

---

## 4. 在 Vercel 导入项目

1. 打开 [vercel.com/new](https://vercel.com/new)
2. 点击 **"Import Git Repository"**，选择你刚推送的仓库
3. **Root Directory** 设为 `ari-next`（重要！）
4. Framework Preset 会自动识别为 **Next.js**

---

## 5. 配置环境变量

在 Vercel 项目设置 → **Environment Variables** 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://neondb_owner:...@...pooler.../neondb?sslmode=require&channel_binding=require` | Neon Pooler URL |
| `DIRECT_URL` | `postgresql://neondb_owner:...@.../neondb?sslmode=require` | Neon Direct URL（用于 migrate） |
| `JWT_SECRET` | 随机长字符串（建议 64+ 字符） | JWT 签名密钥 |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | 你的 cloud_name | Cloudinary |
| `CLOUDINARY_API_KEY` | 你的 api_key | Cloudinary |
| `CLOUDINARY_API_SECRET` | 你的 api_secret | Cloudinary |
| `NEXT_PUBLIC_BASE_URL` | `https://你的域名.vercel.app` | 网站 URL |

> **生成安全的 JWT_SECRET**：
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## 6. 部署

点击 **Deploy** 按钮，Vercel 会自动：
1. `npm install`
2. `prisma generate`
3. `next build`
4. 部署到 CDN

首次部署约 2-3 分钟。

---

## 7. 运行数据库 Migration（仅首次）

如果 Neon 数据库是全新的（没有运行过 `prisma migrate dev`），需要在本地运行一次：

```bash
cd ari-next
npx prisma migrate deploy
```

或者直接 `prisma db push`（适合初期快速上线）：

```bash
npx prisma db push
```

---

## 8. 验证部署

上线后访问：
- `https://你的域名.vercel.app` — 首页
- `https://你的域名.vercel.app/api/auth/me` — 应返回 401（未登录）
- `https://你的域名.vercel.app/store` — 商店页
- 注册账号 → 加购物车 → 结算 → 查看订单历史

---

## 常见问题

**Q: 部署报 "PrismaClientInitializationError"**  
A: 检查 `DATABASE_URL` 是否正确，确认用了 Pooler URL（包含 `-pooler`）。

**Q: 登录后购物车为空**  
A: 正常，服务端购物车跟账号绑定，之前 localStorage 的数据不会迁移。

**Q: 音乐播放不了**  
A: 音频文件没上传（体积太大），Era 页面播放器降级为无音频模式。后续可将 FLAC/MP3 托管到 Cloudinary Video 或其他 CDN。
