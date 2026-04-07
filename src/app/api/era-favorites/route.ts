import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/era-favorites — 获取当前用户收藏的 Era 列表
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const eras = await prisma.savedEra.findMany({
    where: { userId: auth.user.userId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(
    eras.map((e) => ({
      id: e.eraId,
      name: e.name,
      year: e.year,
      accentColor: e.accentColor,
      heroImage: e.heroImage,
    }))
  );
}

// POST /api/era-favorites — 同步收藏 Era（全量覆盖）
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { eras }: { eras: { id: string; name: string; year: number; accentColor: string; heroImage: string }[] } = await req.json();

  await prisma.$transaction([
    prisma.savedEra.deleteMany({ where: { userId: auth.user.userId } }),
    ...eras.map((e) =>
      prisma.savedEra.create({
        data: {
          userId: auth.user.userId,
          eraId: e.id,
          name: e.name,
          year: e.year,
          accentColor: e.accentColor,
          heroImage: e.heroImage,
        },
      })
    ),
  ]);

  return NextResponse.json({ ok: true });
}

// DELETE /api/era-favorites — 清空收藏
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  await prisma.savedEra.deleteMany({ where: { userId: auth.user.userId } });
  return NextResponse.json({ ok: true });
}
