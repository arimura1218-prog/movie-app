'use client';

import React, { useState, useEffect } from 'react';

type Movie = {
  id: string;
  title: string;
  genre: string;
  status: string;
  watchedDate: string;
  watcher: string;
  memo: string;
  imageUrl: string;
  rating: number;
};

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [members, setMembers] = useState<string[]>(['太郎', '花子']);
  const [genres, setGenres] = useState<string[]>(['アクション', 'ドラマ', 'アニメ', 'コメディ']);

  // 管理モーダルの開閉状態
  const [isManageOpen, setIsManageOpen] = useState(false);
  // スマホ用：新規登録・編集フォームの開閉状態
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [newMemberName, setNewMemberName] = useState('');
  const [newGenreName, setNewGenreName] = useState('');

  // フォーム入力の状態
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('アクション');
  const [status, setStatus] = useState('観たい');
  const [watchedDate, setWatchedDate] = useState('');
  const [watcher, setWatcher] = useState('太郎');
  const [rating, setRating] = useState<number>(3.5);
  const [memo, setMemo] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // 編集中の作品ID
  const [editingId, setEditingId] = useState<string | null>(null);

  // 検索・フィルタ・並び替えの状態
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMember, setSelectedMember] = useState('全員');
  const [sortBy, setSortBy] = useState('newest');

  // カレンダー用の表示年月状態
  const [currentDate, setCurrentDate] = useState(new Date());

  // データの取得
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch('/api/movies');
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
      }
    } catch (e) {
      console.error('Failed to fetch movies', e);
    }
  };

  // 画像ファイル選択時の処理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 登録または更新の送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const movieData = {
      title,
      genre,
      status,
      watchedDate,
      watcher,
      memo,
      imageUrl,
      rating,
    };

    if (editingId) {
      try {
        const res = await fetch('/api/movies', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...movieData }),
        });

        if (res.ok) {
          setMovies(
            movies.map((m) => (m.id === editingId ? { ...m, ...movieData, id: editingId } : m))
          );
          resetForm();
        }
      } catch (e) {
        console.error('Failed to update movie', e);
      }
    } else {
      try {
        const res = await fetch('/api/movies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(movieData),
        });

        if (res.ok) {
          const savedMovie = await res.json();
          setMovies([savedMovie, ...movies]);
          resetForm();
        }
      } catch (e) {
        console.error('Failed to add movie', e);
      }
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!editingId) return;
    if (!window.confirm('本当にこの作品を削除しますか？')) return;

    try {
      const res = await fetch(`/api/movies?id=${editingId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMovies(movies.filter((m) => m.id !== editingId));
        resetForm();
      } else {
        alert('削除に失敗しました。');
      }
    } catch (e) {
      console.error('Failed to delete movie', e);
    }
  };

  // 編集モードを開始
  const handleStartEdit = (movie: Movie) => {
    setEditingId(movie.id);
    setTitle(movie.title);
    setGenre(movie.genre);
    setStatus(movie.status);
    setWatchedDate(movie.watchedDate || '');
    setWatcher(movie.watcher || members[0]);
    setRating(movie.rating ?? 3.5);
    setMemo(movie.memo || '');
    setImageUrl(movie.imageUrl || '');
    setIsFormOpen(true); // スマホでもフォームが開くようにする
  };

  // フォームのリセット
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setGenre(genres[0] || '');
    setStatus('観たい');
    setWatchedDate('');
    setWatcher(members[0] || '');
    setRating(3.5);
    setMemo('');
    setImageUrl('');
    setIsFormOpen(false);
  };

  // メンバー追加
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim() && !members.includes(newMemberName.trim())) {
      setMembers([...members, newMemberName.trim()]);
      setNewMemberName('');
    }
  };

  // メンバー削除
  const handleRemoveMember = (target: string) => {
    if (members.length <= 1) {
      alert('メンバーは最低1人必要です。');
      return;
    }
    setMembers(members.filter((m) => m !== target));
    if (watcher === target) setWatcher(members.filter((m) => m !== target)[0]);
    if (selectedMember === target) setSelectedMember('全員');
  };

  // ジャンル追加
  const handleAddGenre = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGenreName.trim() && !genres.includes(newGenreName.trim())) {
      setGenres([...genres, newGenreName.trim()]);
      setNewGenreName('');
    }
  };

  // ジャンル削除
  const handleRemoveGenre = (target: string) => {
    if (genres.length <= 1) {
      alert('ジャンルは最低1つ必要です。');
      return;
    }
    setGenres(genres.filter((g) => g !== target));
    if (genre === target) setGenre(genres.filter((g) => g !== target)[0]);
  };

  const getStatusBadgeStyle = (st: string) => {
    if (st === '観た') return 'bg-green-600 text-white';
    if (st === '鑑賞中') return 'bg-purple-600 text-white';
    return 'bg-orange-500 text-white';
  };

  const getStatusTagStyle = (st: string) => {
    if (st === '観た') return 'bg-green-100 text-green-700';
    if (st === '鑑賞中') return 'bg-purple-100 text-purple-700';
    return 'bg-orange-100 text-orange-700';
  };

  // フィルタリングと並び替え
  const filteredAndSortedMovies = movies
    .filter((movie) => {
      if (selectedMember !== '全員' && movie.watcher !== selectedMember) {
        return false;
      }
      if (searchKeyword.trim()) {
        const keyword = searchKeyword.toLowerCase();
        const matchTitle = movie.title.toLowerCase().includes(keyword);
        const matchGenre = movie.genre.toLowerCase().includes(keyword);
        const matchMemo = movie.memo.toLowerCase().includes(keyword);
        const matchWatcher = movie.watcher.toLowerCase().includes(keyword);
        if (!matchTitle && !matchGenre && !matchMemo && !matchWatcher) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return Number(b.id) - Number(a.id);
      } else if (sortBy === 'ratingDesc') {
        return (b.rating ?? 0) - (a.rating ?? 0);
      } else if (sortBy === 'titleAsc') {
        return a.title.localeCompare(b.title, 'ja');
      }
      return 0;
    });

  // カレンダーロジック
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= lastDay; d++) {
    calendarDays.push(d);
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // フォーム部分の共通JSX
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800 text-base">
          {editingId ? '✏️ 作品を編集中' : '新規作品を登録'}
        </h2>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="text-xs text-red-500 hover:underline font-medium"
          >
            キャンセル
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="作品名を入力"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">ジャンル</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">ステータス</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="観たい">観たい</option>
            <option value="鑑賞中">鑑賞中</option>
            <option value="観た">観た</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">視聴日</label>
          <input
            type="date"
            value={watchedDate}
            onChange={(e) => setWatchedDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">記録者</label>
          <select
            value={watcher}
            onChange={(e) => setWatcher(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {members.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          評価 ({rating} / 5.0)
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">ポスター画像</label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-xs text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="text-xs text-red-500 hover:underline whitespace-nowrap font-medium"
            >
              画像削除
            </button>
          )}
        </div>
        {imageUrl && (
          <div className="mt-2 relative w-full h-40 bg-gray-900 rounded-lg overflow-hidden border shadow-sm flex items-center justify-center">
            <img src={imageUrl} alt="プレビュー" className="w-full h-full object-contain" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">メモ・感想</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="感想を入力..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {editingId ? (
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 font-semibold py-2.5 rounded-lg transition text-sm shadow text-white bg-green-600 hover:bg-green-700"
          >
            変更を保存する
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 font-semibold py-2.5 rounded-lg transition text-sm shadow text-white bg-red-600 hover:bg-red-700"
          >
            削除
          </button>
        </div>
      ) : (
        <button
          type="submit"
          className="w-full font-semibold py-2.5 rounded-lg transition text-sm shadow text-white bg-blue-600 hover:bg-blue-700"
        >
          映画を追加
        </button>
      )}
    </form>
  );

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col md:flex-row gap-8 relative">
      {/* PC用左サイドバー ＆ スマホ用フローティング登録ボタン・モーダル */}
      <div className="w-full md:w-1/3">
        {/* スマホ用：上部アクションバー（新規追加ボタン ＆ 管理ボタン） */}
        <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-2xl shadow-md mb-4">
          <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            🎬 映画記録
          </h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition flex items-center gap-1"
            >
              ➕ 追加
            </button>
            <button
              type="button"
              onClick={() => setIsManageOpen(true)}
              className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-2 rounded-xl shadow transition"
            >
              ⚙️ 管理
            </button>
          </div>
        </div>

        {/* PC画面では常時表示する左カラム */}
        <div className="hidden md:block bg-white p-6 rounded-2xl shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🎬 映画・ドラマ記録
            </h1>
            <button
              type="button"
              onClick={() => setIsManageOpen(true)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition"
            >
              ⚙️ 管理
            </button>
          </div>
          {formContent}
        </div>

        {/* スマホ画面で「追加」または「編集」が押されたときに開くモーダルフォーム */}
        {isFormOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="font-bold text-gray-800 text-base">
                  {editingId ? '✏️ 作品を編集' : '新規作品を登録'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>
              {formContent}
            </div>
          </div>
        )}
      </div>

      {/* 右側：一覧表示・検索・並び替え ＆ カレンダー */}
      <div className="flex-1 space-y-8">
        {/* メンバーフィルター（スマホでも常時上部に表示） */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              表示メンバー
            </label>
            <div className="hidden md:block">
              <button
                type="button"
                onClick={() => setIsManageOpen(true)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                + メンバー・ジャンル追加
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedMember('全員')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                selectedMember === '全員'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全員 ({movies.length})
            </button>
            {members.map((m) => {
              const count = movies.filter((mv) => mv.watcher === m).length;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMember(m)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    selectedMember === m
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {m} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 一覧エリア */}
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-2/3">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="🔍 タイトル、ジャンル、メモなどで検索..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">並び替え:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">登録が新しい順</option>
                <option value="ratingDesc">評価が高い順</option>
                <option value="titleAsc">タイトル順 (五十音)</option>
              </select>
            </div>
          </div>

          <div className="text-sm font-bold text-gray-800 border-b pb-3">
            {selectedMember}の登録リスト ({filteredAndSortedMovies.length}件)
          </div>

          {filteredAndSortedMovies.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              該当する映画・ドラマはまだありません。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col bg-white group"
                >
                  {movie.imageUrl ? (
                    <div className="w-full h-64 bg-gray-900 relative overflow-hidden flex items-center justify-center">
                      <div
                        className="absolute inset-0 bg-cover bg-center filter blur-md opacity-40 scale-110"
                        style={{ backgroundImage: `url(${movie.imageUrl})` }}
                      ></div>
                      <img
                        src={movie.imageUrl}
                        alt={movie.title}
                        className="relative z-10 w-full h-full object-contain drop-shadow-md"
                      />
                      <div className="absolute top-3 right-3 z-20">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${getStatusBadgeStyle(
                            movie.status
                          )}`}
                        >
                          {movie.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 relative">
                      <span className="text-4xl">🎬</span>
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${getStatusBadgeStyle(
                            movie.status
                          )}`}
                        >
                          {movie.status}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-800 text-base leading-snug line-clamp-1">
                          {movie.title}
                        </h3>
                        {!movie.imageUrl && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusTagStyle(
                              movie.status
                            )}`}
                          >
                            {movie.status}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600 mt-1.5">
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">
                          {movie.genre}
                        </span>
                        <span>•</span>
                        <span>{movie.watcher}</span>
                        {movie.watchedDate && (
                          <>
                            <span>•</span>
                            <span>{movie.watchedDate}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-sm">
                        <span className="text-yellow-400">
                          {'★'.repeat(Math.floor(movie.rating ?? 0))}
                        </span>
                        <span className="text-gray-300">
                          {'★'.repeat(5 - Math.floor(movie.rating ?? 0))}
                        </span>
                        <span className="text-xs text-gray-600 ml-1 font-medium">
                          ({movie.rating})
                        </span>
                      </div>

                      {movie.memo && (
                        <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg mt-2.5 line-clamp-2">
                          {movie.memo}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(movie)}
                        className="text-xs bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                      >
                        ✏️ 編集する
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* カレンダー */}
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
              📅 視聴カレンダー
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">
                {year}年 {month + 1}月
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold transition"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold transition"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-500 py-1">
            <span className="text-red-500">日</span>
            <span>月</span>
            <span>火</span>
            <span>水</span>
            <span>木</span>
            <span>金</span>
            <span className="text-blue-500">土</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayNum, index) => {
              if (dayNum === null) {
                return <div key={`empty-${index}`} className="h-28 md:h-32 bg-gray-50 rounded-xl"></div>;
              }

              const formattedMonth = String(month + 1).padStart(2, '0');
              const formattedDay = String(dayNum).padStart(2, '0');
              const dateString = `${year}-${formattedMonth}-${formattedDay}`;

              const matchedMovies = movies.filter((movie) => {
                if (!movie.watchedDate) return false;
                if (selectedMember !== '全員' && movie.watcher !== selectedMember) return false;
                return movie.watchedDate === dateString;
              });

              return (
                <div
                  key={`day-${dayNum}`}
                  className="h-28 md:h-32 border border-gray-200 rounded-xl p-1.5 md:p-2 flex flex-col justify-between bg-white overflow-hidden relative group hover:border-blue-400 transition"
                >
                  <span className="text-xs font-bold text-gray-700">{dayNum}</span>

                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto mt-1">
                    {matchedMovies.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleStartEdit(m)}
                        className="cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-1 flex flex-col items-center gap-1 transition shadow-sm"
                        title="クリックして編集"
                      >
                        {m.imageUrl ? (
                          <img
                            src={m.imageUrl}
                            alt={m.title}
                            className="w-full h-10 md:h-14 object-cover rounded shadow-sm"
                          />
                        ) : (
                          <div className="w-full h-8 bg-blue-100 rounded flex items-center justify-center text-sm">
                            🎬
                          </div>
                        )}
                        <span className="text-[10px] md:text-[11px] text-gray-800 text-center truncate w-full font-bold">
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 管理モーダル */}
      {isManageOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-bold text-gray-800 text-lg">⚙️ メンバー・ジャンル管理</h2>
              <button
                type="button"
                onClick={() => setIsManageOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                メンバー管理
              </h3>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {m}
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m)}
                      className="text-gray-400 hover:text-red-500 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddMember} className="flex gap-2">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="新しいメンバー名"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition"
                >
                  追加
                </button>
              </form>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ジャンル管理
              </h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {g}
                    <button
                      type="button"
                      onClick={() => handleRemoveGenre(g)}
                      className="text-gray-400 hover:text-red-500 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddGenre} className="flex gap-2">
                <input
                  type="text"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  placeholder="新しいジャンル名"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition"
                >
                  追加
                </button>
              </form>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setIsManageOpen(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}