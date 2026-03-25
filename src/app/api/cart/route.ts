import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/cart — 获取购物车
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const items = await prisma.cartItem.findMany({
    where: { userId: auth.user.userId },
    orderBy: { id: 'asc' },
  });
  return NextResponse.json(items);
}

// POST /api/cart — 添加商品
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { productId, qty = 1, name, price, img } = await req.json();
  if (!productId || !name || price == null) {
    return NextResponse.json({ error: 'productId, name, price required' }, { status: 400 });
  }

  // upsert: 已存在则累加数量
  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: auth.user.userId, productId } },
    update: { qty: { increment: qty } },
    create: { userId: auth.user.userId, productId, qty, name, price, img },
  });
  return NextResponse.json(item);
}

// DELETE /api/cart — 清空购物车
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  await prisma.cartItem.deleteMany({ where: { userId: auth.user.userId } });
  return NextResponse.json({ ok: true });
}
