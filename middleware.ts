import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // 認証をバイパスしたいパスがあればここに設定できます（基本はそのままでOK）
  const basicAuth = req.headers.get('authorization');

  // 設定するユーザー名とパスワード
  // 例: ユーザー名「admin」、パスワード「secret123」にしたい場合
  const USERNAME = process.env.BASIC_AUTH_USER || 'admin';
  const PASSWORD = process.env.BASIC_AUTH_PASSWORD || 'secret123';

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    // Base64デコード
    const [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':');

    if (user === USERNAME && pwd === PASSWORD) {
      return NextResponse.next();
    }
  }

  // 認証失敗時、または未入力時は認証ポップアップを表示
  return new NextResponse('Auth required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

// 認証をかけたいパスの指定（アプリ全体にかけたい場合はすべて対象にします）
export const config = {
  matcher: ['/:path*'],
};