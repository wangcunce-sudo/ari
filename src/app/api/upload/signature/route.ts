import { NextRequest, NextResponse } from 'next/server';
import { generateUploadSignature } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/upload/signature
 * 生成 Cloudinary 上传签名，供前端直传使用
 */
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get('folder') ?? 'ari-site';

  try {
    const sig = generateUploadSignature(folder);
    return NextResponse.json(sig);
  } catch {
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}
