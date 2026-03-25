import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// PATCH /api/addresses/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json();

  // 若设为默认，先清其他
  if (body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: auth.user.userId },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.updateMany({
    where: { id, userId: auth.user.userId },
    data: body,
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const addr = await prisma.address.findUnique({ where: { id } });
  return NextResponse.json(addr);
}

// DELETE /api/addresses/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  await prisma.address.deleteMany({ where: { id, userId: auth.user.userId } });
  return NextResponse.json({ ok: true });
}
