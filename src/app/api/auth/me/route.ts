import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      include: { addresses: { orderBy: { isDefault: 'desc' } } },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      balance: user.balance,
      addresses: user.addresses,
    });
  } catch (e) {
    console.error('[me]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
