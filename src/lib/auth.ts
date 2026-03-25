import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type JWTPayload } from './jwt';

/** 从请求 cookie 或 Authorization header 中解析 JWT，返回 payload 或 401 Response */
export async function requireAuth(
  req: NextRequest
): Promise<{ user: JWTPayload } | NextResponse> {
  // 1. Cookie（浏览器请求）
  const cookieToken = req.cookies.get('ag_token')?.value;
  // 2. Authorization: Bearer <token>（可选备用）
  const headerToken = req.headers.get('authorization')?.replace('Bearer ', '');

  const token = cookieToken ?? headerToken;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  return { user: payload };
}

/** 标准化 API 错误响应 */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
