'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 設定したい共通パスワード（yuumari1229）
    const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || 'secret2026';

    if (password === CORRECT_PASSWORD) {
      // 認証成功：クッキーに「1年間有効な認証済みフラグ」を保存する
      document.cookie = `my-movie-app-auth=authenticated; path=/; max-age=${60 * 60 * 24 * 365}`;
      // アプリのトップページへ移動
      router.push('/');
      router.refresh();
    } else {
      // 認証失敗
      setError(true);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-950 text-white">
      <div className="w-full max-w-sm p-8 bg-gray-900 rounded-2xl shadow-xl border border-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-center">映画アプリ ログイン</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              パスワードを入力
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="パスワード"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">パスワードが間違っています。</p>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
          >
            ログイン
          </button>
        </form>
      </div>
    </main>
  );
}