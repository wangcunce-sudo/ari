import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/addresses
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const addresses = await prisma.address.findMany({
    where: { userId: auth.user.userId },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  });
  return NextResponse.json(addresses);
}

// POST /api/addresses — 新增地址
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { label, name, email, address, city, zip, country, isDefault } = body;

  if (!name || !email || !address || !city || !zip || !country) {
    return NextResponse.json({ error: 'All address fields required' }, { status: 400 });
  }

  // 若设为默认，先清掉其他默认
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: auth.user.userId },
      data: { isDefault: false },
    });
  }

  const newAddr = await prisma.address.create({
    data: { userId: auth.user.userId, label: label ?? 'Home', name, email, address, city, zip, country, isDefault: !!isDefault },
  });
  return NextResponse.json(newAddr, { status: 201 });
}
