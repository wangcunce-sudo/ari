import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// PATCH /api/cart/[productId] — 修改数量
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { productId } = await params;
  const { qty } = await req.json();
  const pid = parseInt(productId, 10);

  if (qty <= 0) {
    await prisma.cartItem.deleteMany({
      where: { userId: auth.user.userId, productId: pid },
    });
    return NextResponse.json({ ok: true });
  }

  const item = await prisma.cartItem.update({
    where: { userId_productId: { userId: auth.user.userId, productId: pid } },
    data: { qty },
  });
  return NextResponse.json(item);
}

// DELETE /api/cart/[productId] — 删除单项
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { productId } = await params;
  await prisma.cartItem.deleteMany({
    where: { userId: auth.user.userId, productId: parseInt(productId, 10) },
  });
  return NextResponse.json({ ok: true });
}
