import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/playlist — 获取当前用户的播放列表
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const tracks = await prisma.playlistTrack.findMany({
    where: { userId: auth.user.userId },
    orderBy: { sortIndex: 'asc' },
  });

  return NextResponse.json(
    tracks.map((t) => ({
      id: t.trackId,
      eraId: t.eraId,
      eraName: t.eraName,
      eraYear: t.eraYear,
      accentColor: t.accentColor,
      title: t.title,
      audioSrc: t.audioSrc ?? undefined,
      albumArt: t.albumArt ?? undefined,
    }))
  );
}

// POST /api/playlist — 同步整个播放列表（全量覆盖）
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { tracks }: { tracks: { id: string; eraId: string; eraName: string; eraYear: number; accentColor: string; title: string; audioSrc?: string; albumArt?: string }[] } = await req.json();

  // 先清空再批量写入（事务保证原子性）
  await prisma.$transaction([
    prisma.playlistTrack.deleteMany({ where: { userId: auth.user.userId } }),
    ...tracks.map((t, i) =>
      prisma.playlistTrack.create({
        data: {
          userId: auth.user.userId,
          trackId: t.id,
          eraId: t.eraId,
          eraName: t.eraName,
          eraYear: t.eraYear,
          accentColor: t.accentColor,
          title: t.title,
          audioSrc: t.audioSrc ?? null,
          albumArt: t.albumArt ?? null,
          sortIndex: i,
        },
      })
    ),
  ]);

  return NextResponse.json({ ok: true });
}

// DELETE /api/playlist — 清空播放列表
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  await prisma.playlistTrack.deleteMany({ where: { userId: auth.user.userId } });
  return NextResponse.json({ ok: true });
}
