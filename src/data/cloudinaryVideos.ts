// 自动生成 by scripts/upload-media.mjs — 请勿手动编辑
// Cloudinary 视频 URL 映射（key = 文件名不含扩展名）
export const CLOUDINARY_VIDEOS: Record<string, string> = {
  "dangerous_woman_intoyou": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774455739/ari-site/videos/dangerous_woman_intoyou.mp4",
  "dangerous_woman_sidetoside": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774455810/ari-site/videos/dangerous_woman_sidetoside.mp4",
  "dangerous_woman_dangerouswoman": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774455738/ari-site/videos/dangerous_woman_dangerouswoman.mp4",
  "eternal_sunshine_yesand": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774455842/ari-site/videos/eternal_sunshine_yesand.mp4",
  "my_everything_problem": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774455909/ari-site/videos/my_everything_problem.mp4",
  "positions_3435": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774456421/ari-site/videos/positions_3435.mp4",
  "my_everything_breakfree": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774455878/ari-site/videos/my_everything_breakfree.mp4",
  "positions_positions": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774456417/ari-site/videos/positions_positions.mp4",
  "positions_pov": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774456556/ari-site/videos/positions_pov.mp4",
  "sweetener_breathin": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774456353/ari-site/videos/sweetener_breathin.mp4",
  "sweetener_notears": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774456388/ari-site/videos/sweetener_notears.mp4",
  "sweetener_godisawoman": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774456448/ari-site/videos/sweetener_godisawoman.mp4",
  "thankunext_7rings": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774456425/ari-site/videos/thankunext_7rings.mp4",
  "thankunext_breakupwithyourgirlfriend": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774456272/ari-site/videos/thankunext_breakupwithyourgirlfriend.mp4",
  "thankunext_thankunext": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774456541/ari-site/videos/thankunext_thankunext.mp4",
  "yours_truly_theway": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774456535/ari-site/videos/yours_truly_theway.mp4",
  "eternal_sunshine_wecantbefriends": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774461110/ari-site/videos/eternal_sunshine_wecantbefriends.mp4",
  "eternal_sunshine_theboyismine": "https://res.cloudinary.com/do2vfccwx/video/upload/v1774461117/ari-site/videos/eternal_sunshine_theboyismine.mp4"
};

/**
 * 获取 URL：优先 Cloudinary，回退本地
 */
export function getVIDEOSUrl(key: string, fallbackDir = ''): string {
  return CLOUDINARY_VIDEOS[key] ?? (fallbackDir ? `/${fallbackDir}/${key}` : key);
}
