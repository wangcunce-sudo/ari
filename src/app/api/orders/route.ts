import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/orders — 订单列表
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const orders = await prisma.order.findMany({
    where: { userId: auth.user.userId },
    include: { items: true },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(orders);
}

// POST /api/orders — 下单
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { shipping } = await req.json();
  if (!shipping) {
    return NextResponse.json({ error: 'shipping required' }, { status: 400 });
  }

  // 在事务中：读购物车 → 验余额 → 创建订单 → 清空购物车 → 扣余额
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: auth.user.userId } });
      if (!user) throw new Error('User not found');

      const cartItems = await tx.cartItem.findMany({ where: { userId: auth.user.userId } });
      if (cartItems.length === 0) throw new Error('Cart is empty');

      const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
      if (total > user.balance) throw new Error('Insufficient balance');

      const orderId = `AG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const order = await tx.order.create({
        data: {
          id: orderId,
          userId: auth.user.userId,
          total,
          shipping,
          items: {
            create: cartItems.map((i) => ({
              productId: i.productId,
              qty: i.qty,
              name: i.name,
              price: i.price,
              img: i.img,
            })),
          },
        },
        include: { items: true },
      });

      // 清空购物车
      await tx.cartItem.deleteMany({ where: { userId: auth.user.userId } });

      // 扣余额
      const updatedUser = await tx.user.update({
        where: { id: auth.user.userId },
        data: { balance: { decrement: total } },
      });

      return { order, balance: updatedUser.balance };
    });

    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Server error';
    const status = msg === 'Insufficient balance' || msg === 'Cart is empty' ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
