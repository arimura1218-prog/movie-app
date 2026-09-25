import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ログインページ自体や、APIなどの静的ファイルへのアクセスはブロックしない
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // クッキーからログイン済みかチェック
  const authCookie = req.cookies.get('my-movie-app-auth');

  // ログインしていなければ /login ページへ強制送還
  if (!authCookie || authCookie.value !== 'authenticated') {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};