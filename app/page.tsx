'use client';

import React, { useState, useEffect, useRef } from 'react';

type Movie = {
  id: string;
  title: string;
  genre: string;
  status: string;
  watchedDate: string;
  watchers: string[];
  memo: string;
  imageUrl: string;
  rating: number;
};

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);

  const [members, setMembers] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('members');
      if (saved) {
        const parsed = JSON.parse(saved);
        const defaultMembers = ['ユウ', 'マリコ'];
        const combined = Array.from(new Set([...parsed, ...defaultMembers]));
        return combined.filter(m => m !== '太郎' && m !== '花子');
      }
    }
    return ['ユウ', 'マリコ'];
  });

  const [genres, setGenres] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('genres');
      if (saved) return JSON.parse(saved);
    }
    return ['アクション', 'ドラマ', 'アニメ', 'ラブコメディ'];
  });

  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  // カレンダー拡大用モーダルの開閉ステート
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const [newMemberName, setNewMemberName] = useState('');
  const [newGenreName, setNewGenreName] = useState('');

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState(genres[0] || 'アクション');
  const [status, setStatus] = useState('観たい');
  const [watchedDate, setWatchedDate] = useState('');
  const [watchers, setWatchers] = useState<string[]>([]);
  const [rating, setRating] = useState<number>(3.5);
  const [memo, setMemo] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchKeyword, setSearchKeyword] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('searchKeyword') || '';
    return '';
  });
  const [selectedMember, setSelectedMember] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('selectedMember') || '全員';
    return '全員';
  });
  const [sortBy, setSortBy] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('sortBy') || 'newest';
    return 'newest';
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [currentDate, setCurrentDate] = useState(new Date());

  const [highlightedMovieId, setHighlightedMovieId] = useState<string | null>(null);
  const movieCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedMember, sortBy]);

  useEffect(() => {
    localStorage.setItem('searchKeyword', searchKeyword);
  }, [searchKeyword]);

  useEffect(() => {
    localStorage.setItem('selectedMember', selectedMember);
  }, [selectedMember]);

  useEffect(() => {
    localStorage.setItem('sortBy', sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('genres', JSON.stringify(genres));
  }, [genres]);

  useEffect(() => {
    if (watchers.length === 0 && members.length > 0) {
      setWatchers([members[0]]);
    }
  }, [members]);

  const fetchMovies = async () => {
    try {
      const res = await fetch('/api/movies');
      if (res.ok) {
        const data = await res.json();
        const formattedData = data.map((m: any) => ({
          ...m,
          watchers: m.watchers || (m.watcher ? [m.watcher] : [members[0] || 'ユウ']),
        }));
        setMovies(formattedData);
      }
    } catch (e) {
      console.error('Failed to fetch movies', e);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const movieData = {
      title,
      genre,
      status,
      watchedDate,
      watchers,
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
          const formattedMovie = {
            ...savedMovie,
            watchers: savedMovie.watchers || watchers,
          };
          setMovies([formattedMovie, ...movies]);
          resetForm();
        }
      } catch (e) {
        console.error('Failed to add movie', e);
      }
    }
  };

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

  const handleStartEdit = (movie: Movie) => {
    setEditingId(movie.id);
    setTitle(movie.title);
    setGenre(movie.genre);
    setStatus(movie.status);
    setWatchedDate(movie.watchedDate || '');
    setWatchers(movie.watchers && movie.watchers.length > 0 ? movie.watchers : [members[0] || 'ユウ']);
    setRating(movie.rating ?? 3.5);
    setMemo(movie.memo || '');
    setImageUrl(movie.imageUrl || '');
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setGenre(genres[0] || '');
    setStatus('観たい');
    setWatchedDate('');
    setWatchers([members[0] || '']);
    setRating(3.5);
    setMemo('');
    setImageUrl('');
    setIsFormOpen(false);
  };

  const handleWatcherToggle = (member: string) => {
    if (watchers.includes(member)) {
      if (watchers.length === 1) {
        alert('鑑賞者は最低1人選択してください。');
        return;
      }
      setWatchers(watchers.filter((w) => w !== member));
    } else {
      setWatchers([...watchers, member]);
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim() && !members.includes(newMemberName.trim())) {
      setMembers([...members, newMemberName.trim()]);
      setNewMemberName('');
    }
  };

  const handleRemoveMember = (target: string) => {
    if (members.length <= 1) {
      alert('メンバーは最低1人必要です。');
      return;
    }
    setMembers(members.filter((m) => m !== target));
    setMovies(movies.map(m => ({
      ...m,
      watchers: m.watchers.filter(w => w !== target)
    })));
    if (watchers.includes(target)) {
      setWatchers(watchers.filter(w => w !== target));
    }
    if (selectedMember === target) setSelectedMember('全員');
  };

  const handleAddGenre = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGenreName.trim() && !genres.includes(newGenreName.trim())) {
      setGenres([...genres, newGenreName.trim()]);
      setNewGenreName('');
    }
  };

  const handleRemoveGenre = (target: string) => {
    if (genres.length <= 1) {
      alert('ジャンルは最低1つ必要です。');
      return;
    }
    setGenres(genres.filter((g) => g !== target));
    if (genre === target) setGenre(genres.filter((g) => g !== target)[0]);
  };

  const getStatusBadgeStyle = (st: string) => {
    if (st === '観た') return 'bg-[#7a4f43] text-white';
    if (st === '鑑賞中') return 'bg-[#5a6b5c] text-white';
    return 'bg-[#9c6644] text-white';
  };

  const getStatusTagStyle = (st: string) => {
    if (st === '観た') return 'bg-[#f0e4df] text-[#7a4f43] border border-[#d4b5ad]';
    if (st === '鑑賞中') return 'bg-[#e2e8e3] text-[#5a6b5c] border border-[#b8c7b9]';
    return 'bg-[#f4ebe3] text-[#9c6644] border border-[#e0c9b7]';
  };

  // カレンダー用ロジック
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

  const filteredAndSortedMovies = movies
    .filter((movie) => {
      if (selectedMember !== '全員' && !movie.watchers?.includes(selectedMember)) {
        return false;
      }
      if (searchKeyword.trim()) {
        const keyword = searchKeyword.toLowerCase();
        const matchTitle = movie.title.toLowerCase().includes(keyword);
        const matchGenre = movie.genre.toLowerCase().includes(keyword);
        const matchMemo = movie.memo.toLowerCase().includes(keyword);
        const matchWatcher = movie.watchers?.some(w => w.toLowerCase().includes(keyword));
        if (!matchTitle && !matchGenre && !matchMemo && !matchWatcher) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return Number(b.id) - Number(a.id);
      } else if (sortBy === 'statusOrder') {
        const statusRank: { [key: string]: number } = { '観たい': 1, '鑑賞中': 2, '観た': 3 };
        const rankA = statusRank[a.status] || 99;
        const rankB = statusRank[b.status] || 99;
        if (rankA !== rankB) {
          return rankA - rankB;
        }
        return Number(b.id) - Number(a.id);
      } else if (sortBy === 'watchedDateDesc') {
        const dateA = a.watchedDate ? new Date(a.watchedDate).getTime() : 0;
        const dateB = b.watchedDate ? new Date(b.watchedDate).getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === 'watchedDateAsc') {
        const dateA = a.watchedDate ? new Date(a.watchedDate).getTime() : Infinity;
        const dateB = b.watchedDate ? new Date(b.watchedDate).getTime() : Infinity;
        return dateA - dateB;
      } else if (sortBy === 'ratingDesc') {
        return (b.rating ?? 0) - (a.rating ?? 0);
      } else if (sortBy === 'titleAsc') {
        return a.title.localeCompare(b.title, 'ja');
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredAndSortedMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = filteredAndSortedMovies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleJumpToMovie = (movie: Movie) => {
    // モーダルが開いている場合は閉じる
    setIsCalendarModalOpen(false);

    if (selectedMember !== '全員' && !movie.watchers?.includes(selectedMember)) {
      setSelectedMember('全員');
    }
    if (searchKeyword.trim()) {
      setSearchKeyword('');
    }

    setTimeout(() => {
      const targetIndex = filteredAndSortedMovies.findIndex((m) => m.id === movie.id);
      if (targetIndex !== -1) {
        const targetPage = Math.floor(targetIndex / ITEMS_PER_PAGE) + 1;
        setCurrentPage(targetPage);

        setTimeout(() => {
          const cardElement = movieCardRefs.current[movie.id];
          if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedMovieId(movie.id);
            setTimeout(() => {
              setHighlightedMovieId(null);
            }, 2000);
          }
        }, 100);
      }
    }, 50);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#3d3832] text-base">
          {editingId ? '✏️ 作品を編集中' : '新規作品を登録'}
        </h2>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="text-xs text-[#a34743] hover:underline font-medium"
          >
            キャンセル
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#5c5346] mb-1">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="作品名を入力"
          required
          className="w-full border border-[#d6cfc2] rounded-lg px-3 py-2 text-sm text-[#3d3832] bg-[#fbf9f5] placeholder-[#a69e91] focus:outline-none focus:ring-2 focus:ring-[#a34743]"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-[#5c5346] mb-1">ジャンル</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full border border-[#d6cfc2] rounded-lg px-3 py-2 text-sm text-[#3d3832] bg-[#fbf9f5] focus:outline-none focus:ring-2 focus:ring-[#a34743]"
          >
            {genres.map((g) => (
              <option key={g} value={g} className="bg-[#fbf9f5] text-[#3d3832]">
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#5c5346] mb-1">ステータス</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-[#d6cfc2] rounded-lg px-3 py-2 text-sm text-[#3d3832] bg-[#fbf9f5] focus:outline-none focus:ring-2 focus:ring-[#a34743]"
          >
            <option value="観たい" className="bg-[#fbf9f5] text-[#3d3832]">観たい</option>
            <option value="鑑賞中" className="bg-[#fbf9f5] text-[#3d3832]">鑑賞中</option>
            <option value="観た" className="bg-[#fbf9f5] text-[#3d3832]">観た</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#5c5346] mb-1">鑑賞日</label>
        <input
          type="date"
          value={watchedDate}
          onChange={(e) => setWatchedDate(e.target.value)}
          className="w-full border border-[#d6cfc2] rounded-lg px-3 py-2 text-sm text-[#3d3832] bg-[#fbf9f5] focus:outline-none focus:ring-2 focus:ring-[#a34743]"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#5c5346] mb-1">鑑賞者 (複数選択可)</label>
        <div className="flex flex-wrap gap-2 pt-1">
          {members.map((m) => {
            const isSelected = watchers.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => handleWatcherToggle(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  isSelected
                    ? 'bg-[#7a4f43] text-white border-[#7a4f43] shadow-sm'
                    : 'bg-[#fbf9f5] text-[#786e61] border-[#d6cfc2] hover:bg-[#f0ebe1]'
                }`}
              >
                {isSelected ? `✓ ${m}` : m}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-[#5c5346]">評価</label>
          <span className="text-xs font-bold text-[#a34743]">★ {rating} / 5.0</span>
        </div>
        <div className="flex items-center gap-3 bg-[#fbf9f5] border border-[#d6cfc2] rounded-lg px-3 py-2.5">
          <span className="text-sm">⭐</span>
          <input
            type="range"
            min="0.5"
            max="5.0"
            step="0.5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full accent-[#a34743] cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#5c5346] mb-1">ポスター画像</label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-xs text-[#5c5346] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#f0ebe1] file:text-[#7a4f43] hover:file:bg-[#e4dcd0] cursor-pointer"
          />
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="text-xs text-[#a34743] hover:underline whitespace-nowrap font-medium"
            >
              画像削除
            </button>
          )}
        </div>
        {imageUrl && (
          <div className="mt-2 relative w-full h-40 bg-[#fbf9f5] rounded-lg overflow-hidden border border-[#d6cfc2] shadow-sm flex items-center justify-center">
            <img src={imageUrl} alt="プレビュー" className="w-full h-full object-contain" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#5c5346] mb-1">メモ・感想</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="感想を入力..."
          rows={3}
          className="w-full border border-[#d6cfc2] rounded-lg px-3 py-2 text-sm text-[#3d3832] bg-[#fbf9f5] placeholder-[#a69e91] focus:outline-none focus:ring-2 focus:ring-[#a34743] resize-none"
        />
      </div>

      {editingId ? (
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 font-semibold py-2.5 rounded-lg transition text-sm shadow-sm text-white bg-[#5a6b5c] hover:bg-[#4b594d]"
          >
            変更を保存する
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 font-semibold py-2.5 rounded-lg transition text-sm shadow-sm text-white bg-[#a34743] hover:bg-[#8e3c39]"
          >
            削除
          </button>
        </div>
      ) : (
        <button
          type="submit"
          className="w-full font-semibold py-2.5 rounded-lg transition text-sm shadow-sm text-white bg-[#7a4f43] hover:bg-[#684238]"
        >
          映画を追加
        </button>
      )}
    </form>
  );

  // カレンダー描画用の中身（通常＆拡大モーダル共通で使用）
  const renderCalendarContent = (isLarge = false) => {
    const heightClass = isLarge ? 'h-24 md:h-32' : 'h-16';
    const textClass = isLarge ? 'text-xs md:text-sm' : 'text-[10px]';

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#3d3832] flex items-center gap-1.5">
            📅 鑑賞カレンダー
          </h2>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#5c5346]">
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-1 hover:bg-[#f0ebe1] rounded transition"
            >
              ◀
            </button>
            <span className="min-w-[70px] text-center font-bold">
              {year}年{month + 1}月
            </span>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-1 hover:bg-[#f0ebe1] rounded transition"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#8c8273] pb-1 border-b border-[#d6cfc2]">
          <span className="text-[#a34743]">日</span>
          <span>月</span>
          <span>火</span>
          <span>水</span>
          <span>木</span>
          <span>金</span>
          <span className="text-[#4a6b82]">土</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((d, i) => {
            if (d === null) {
              return <div key={`empty-${i}`} className={`${heightClass} bg-[#f0ebe1]/30 rounded-lg`}></div>;
            }
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayMovies = movies.filter((m) => m.watchedDate === dateStr);
            const hasWatched = dayMovies.length > 0;
            const movie = hasWatched ? dayMovies[0] : null;

            return (
              <div
                key={`day-${d}`}
                className={`${heightClass} flex flex-col items-center justify-between p-1 rounded-lg border relative overflow-hidden ${textClass} ${
                  hasWatched 
                    ? 'bg-white border-[#d4b5ad] shadow-sm' 
                    : 'bg-[#f4efe6] border-[#d6cfc2] text-[#8c8273]'
                }`}
              >
                <span className={`self-start font-mono leading-none z-10 ${hasWatched ? 'text-[#a34743] font-bold bg-white/90 px-1 rounded' : 'text-[#8c8273]'}`}>
                  {d}
                </span>

                {movie && movie.imageUrl ? (
                  <div 
                    onClick={() => handleJumpToMovie(movie)}
                    className="absolute inset-0 pt-4 cursor-pointer group flex items-center justify-center"
                    title={`${movie.title} (クリックでジャンプ)`}
                  >
                    <img 
                      src={movie.imageUrl} 
                      alt={movie.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition" 
                    />
                  </div>
                ) : movie ? (
                  <div 
                    onClick={() => handleJumpToMovie(movie)}
                    className="absolute inset-0 pt-4 cursor-pointer flex items-center justify-center text-[10px] text-[#7a4f43] text-center px-0.5 overflow-hidden font-medium bg-[#f0e4df]/70"
                    title={`${movie.title} (クリックでジャンプ)`}
                  >
                    {movie.title}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#f4efe6] text-[#3d3832] p-4 md:p-8 flex flex-col md:flex-row gap-8 relative">
      {/* 左カラム：PCではフォーム、スマホでも上部に配置 */}
      <div className="w-full md:w-1/3">
        <div className="md:hidden flex items-center justify-between bg-[#fbf9f5] border border-[#d6cfc2] p-4 rounded-2xl shadow-sm mb-4">
          <h1 className="text-base font-bold text-[#3d3832] flex items-center gap-1.5 whitespace-nowrap">
            🎬 映画記録
          </h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="bg-[#7a4f43] text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition flex items-center gap-1"
            >
              ➕ 追加
            </button>
            <button
              type="button"
              onClick={() => setIsManageOpen(true)}
              className="bg-[#f0ebe1] text-[#3d3832] text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition"
            >
              ⚙️ 管理
            </button>
          </div>
        </div>

        <div className="hidden md:block bg-[#fbf9f5] border border-[#d6cfc2] p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-base lg:text-lg font-bold text-[#3d3832] flex items-center gap-1.5 whitespace-nowrap">
              🎬 映画記録
            </h1>
            <button
              type="button"
              onClick={() => setIsManageOpen(true)}
              className="text-xs bg-[#f0ebe1] hover:bg-[#e4dcd0] text-[#3d3832] px-2.5 py-1.5 rounded-lg font-medium transition whitespace-nowrap"
            >
              ⚙️ 管理
            </button>
          </div>
          {formContent}
        </div>

        {isFormOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-[#fbf9f5] border border-[#d6cfc2] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#d6cfc2] pb-2">
                <h2 className="font-bold text-[#3d3832] text-base">
                  {editingId ? '✏️ 作品を編集' : '新規作品を登録'}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-[#8c8273] hover:text-[#3d3832] text-lg font-bold"
                >
                  ✕
                </button>
              </div>
              {formContent}
            </div>
          </div>
        )}
      </div>

      {/* 右カラム：メインの一覧エリア ＆ その下にカレンダーを配置 */}
      <div className="flex-1 space-y-8 flex flex-col">
        <div className="bg-[#fbf9f5] border border-[#d6cfc2] p-4 md:p-6 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#8c8273] uppercase tracking-wider">
              表示メンバー
            </label>
            <div className="hidden md:block">
              <button
                type="button"
                onClick={() => setIsManageOpen(true)}
                className="text-xs text-[#a34743] hover:underline font-medium"
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
                  ? 'bg-[#7a4f43] text-white shadow-sm'
                  : 'bg-[#f0ebe1] text-[#5c5346] hover:bg-[#e4dcd0]'
              }`}
            >
              全員 ({movies.length})
            </button>
            {members.map((m) => {
              const count = movies.filter((mv) => mv.watchers?.includes(m)).length;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMember(m)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    selectedMember === m
                      ? 'bg-[#7a4f43] text-white shadow-sm'
                      : 'bg-[#f0ebe1] text-[#5c5346] hover:bg-[#e4dcd0]'
                  }`}
                >
                  {m} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-[#fbf9f5] border border-[#d6cfc2] p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-2/3">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="🔍 タイトル、ジャンル、鑑賞者、メモなどで検索..."
                className="w-full border border-[#d6cfc2] rounded-lg px-4 py-2.5 text-sm text-[#3d3832] placeholder-[#a69e91] focus:outline-none focus:ring-2 focus:ring-[#a34743] bg-white"
              />
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-xs font-semibold text-[#5c5346] whitespace-nowrap">並び替え:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto border border-[#d6cfc2] rounded-lg px-3 py-2 text-sm text-[#3d3832] bg-white focus:outline-none focus:ring-2 focus:ring-[#a34743]"
              >
                <option value="newest" className="bg-white text-[#3d3832]">登録が新しい順</option>
                <option value="statusOrder" className="bg-white text-[#3d3832]">ステータス順 (観たい→鑑賞中→観た)</option>
                <option value="watchedDateDesc" className="bg-white text-[#3d3832]">鑑賞日が新しい順</option>
                <option value="watchedDateAsc" className="bg-white text-[#3d3832]">鑑賞日が古い順</option>
                <option value="ratingDesc" className="bg-white text-[#3d3832]">評価が高い順</option>
                <option value="titleAsc" className="bg-white text-[#3d3832]">タイトル順 (五十音)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-[#d6cfc2] pb-3">
            <div className="text-sm font-bold text-[#3d3832]">
              {selectedMember}の登録リスト ({filteredAndSortedMovies.length}件中)
            </div>
            {filteredAndSortedMovies.length > 0 && (
              <div className="text-xs text-[#8c8273]">
                {currentPage} / {totalPages || 1} ページ
              </div>
            )}
          </div>

          {paginatedMovies.length === 0 ? (
            <div className="text-center py-12 text-[#8c8273] text-sm">
              該当する映画・ドラマはまだありません。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedMovies.map((movie) => {
                const currentRating = movie.rating ?? 3.5;
                const isHighlighted = highlightedMovieId === movie.id;
                return (
                  <div
                    key={movie.id}
                    ref={(el) => { movieCardRefs.current[movie.id] = el; }}
                    className={`border rounded-2xl overflow-hidden shadow-sm transition flex flex-col bg-white group ${
                      isHighlighted 
                        ? 'border-[#a34743] ring-4 ring-[#a34743]/30 scale-[1.02] duration-300' 
                        : 'border-[#d6cfc2] hover:shadow-md hover:border-[#b8af9f]'
                    }`}
                  >
                    {movie.imageUrl ? (
                      <div className="w-full h-64 bg-[#f0ebe1] relative overflow-hidden flex items-center justify-center">
                        <div
                          className="absolute inset-0 bg-cover bg-center filter blur-md opacity-20 scale-110"
                          style={{ backgroundImage: `url(${movie.imageUrl})` }}
                        ></div>
                        <img
                          src={movie.imageUrl}
                          alt={movie.title}
                          className="relative z-10 w-full h-full object-contain drop-shadow-sm"
                        />
                        <div className="absolute top-3 right-3 z-20">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusBadgeStyle(
                              movie.status
                            )}`}
                          >
                            {movie.status}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-[#f0ebe1] flex items-center justify-center text-[#a69e91] relative">
                        <span className="text-4xl">🎬</span>
                        <div className="absolute top-3 right-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusBadgeStyle(
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
                          <h3 className="font-bold text-[#3d3832] text-base leading-snug line-clamp-1">
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

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs text-[#786e61] mt-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-[#f4efe6] border border-[#d6cfc2] px-2 py-0.5 rounded font-medium text-[#5c5346]">
                              {movie.genre}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span>鑑賞者: {movie.watchers?.join(', ')}</span>
                          </div>
                          {movie.watchedDate && (
                            <div className="flex items-center gap-1.5">
                              <span className="hidden sm:inline">•</span>
                              <span>鑑賞日: {movie.watchedDate}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex items-center text-base leading-none">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const fillPercentage = Math.max(
                                0,
                                Math.min(100, (currentRating - (star - 1)) * 100)
                              );
                              return (
                                <div key={star} className="relative inline-block w-4 h-4 text-[#d6cfc2]">
                                  <span className="absolute inset-0 text-[#d6cfc2]">★</span>
                                  <span
                                    className="absolute inset-0 overflow-hidden text-[#c27842]"
                                    style={{ width: `${fillPercentage}%` }}
                                  >
                                    ★
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-xs text-[#786e61] font-medium">
                            ({currentRating})
                          </span>
                        </div>

                        {movie.memo && (
                          <div className="text-xs text-[#5c5346] bg-[#f9f7f2] border border-[#e6decf] p-2.5 rounded-lg mt-2.5 max-h-24 overflow-y-auto whitespace-pre-wrap break-words">
                            {movie.memo}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#e6decf] flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(movie)}
                          className="text-xs bg-[#f0ebe1] hover:bg-[#e4dcd0] text-[#3d3832] font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          ✏️ 編集する
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#d6cfc2]">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#f0ebe1] hover:bg-[#e4dcd0] disabled:opacity-35 disabled:hover:bg-[#f0ebe1] text-[#3d3832] text-xs font-bold rounded-lg transition"
              >
                ◀ 前の5件
              </button>

              <span className="text-xs text-[#8c8273]">
                {currentPage} / {totalPages} ページ
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#f0ebe1] hover:bg-[#e4dcd0] disabled:opacity-35 disabled:hover:bg-[#f0ebe1] text-[#3d3832] text-xs font-bold rounded-lg transition"
              >
                次の5件 ▶
              </button>
            </div>
          )}
        </div>

        {/* 映画一覧の下にあるカレンダー ＋ 「大きく見る」ボタン */}
        <div className="space-y-2">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsCalendarModalOpen(true)}
              className="text-xs font-bold bg-[#7a4f43] hover:bg-[#684238] text-white px-3.5 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              🔍 カレンダーを大きく見る
            </button>
          </div>
          <div className="bg-[#fbf9f5] border border-[#d6cfc2] p-5 rounded-2xl shadow-sm">
            {renderCalendarContent(false)}
          </div>
        </div>
      </div>

      {/* カレンダー拡大表示用モーダル */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#fbf9f5] border border-[#d6cfc2] rounded-3xl p-6 w-full max-w-2xl space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#d6cfc2] pb-3">
              <h2 className="font-bold text-[#3d3832] text-base">📅 カレンダー（拡大表示）</h2>
              <button
                type="button"
                onClick={() => setIsCalendarModalOpen(false)}
                className="text-[#8c8273] hover:text-[#3d3832] text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>
            
            {renderCalendarContent(true)}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCalendarModalOpen(false)}
                className="bg-[#7a4f43] hover:bg-[#684238] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メンバー・ジャンル管理モーダル */}
      {isManageOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#fbf9f5] border border-[#d6cfc2] rounded-2xl p-6 w-full max-w-md space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#d6cfc2] pb-3">
              <h2 className="font-bold text-[#3d3832] text-base">⚙️ メンバー・ジャンル管理</h2>
              <button
                type="button"
                onClick={() => setIsManageOpen(false)}
                className="text-[#8c8273] hover:text-[#3d3832] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* メンバー管理 */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[#5c5346] uppercase tracking-wider">鑑賞メンバー管理</h3>
              <form onSubmit={handleAddMember} className="flex gap-2">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="新しいメンバー名"
                  className="flex-1 border border-[#d6cfc2] rounded-lg px-3 py-2 text-sm text-[#3d3832] bg-white focus:outline-none focus:ring-2 focus:ring-[#a34743]"
                />
                <button
                  type="submit"
                  className="bg-[#7a4f43] hover:bg-[#684238] text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                >
                  追加
                </button>
              </form>
              <div className="flex flex-wrap gap-2 pt-1">
                {members.map((m) => (
                  <div key={m} className="flex items-center gap-1.5 bg-white border border-[#d6cfc2] px-3 py-1.5 rounded-lg text-xs text-[#3d3832]">
                    <span>{m}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m)}
                      className="text-[#8c8273] hover:text-[#a34743] font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ジャンル管理 */}
            <div className="space-y-3 pt-4 border-t border-[#d6cfc2]">
              <h3 className="text-xs font-semibold text-[#5c5346] uppercase tracking-wider">ジャンル管理</h3>
              <form onSubmit={handleAddGenre} className="flex gap-2">
                <input
                  type="text"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  placeholder="新しいジャンル名"
                  className="flex-1 border border-[#d6cfc2] rounded-lg px-3 py-2 text-sm text-[#3d3832] bg-white focus:outline-none focus:ring-2 focus:ring-[#a34743]"
                />
                <button
                  type="submit"
                  className="bg-[#7a4f43] hover:bg-[#684238] text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                >
                  追加
                </button>
              </form>
              <div className="flex flex-wrap gap-2 pt-1">
                {genres.map((g) => (
                  <div key={g} className="flex items-center gap-1.5 bg-white border border-[#d6cfc2] px-3 py-1.5 rounded-lg text-xs text-[#3d3832]">
                    <span>{g}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGenre(g)}
                      className="text-[#8c8273] hover:text-[#a34743] font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsManageOpen(false)}
                className="bg-[#f0ebe1] hover:bg-[#e4dcd0] text-[#3d3832] text-xs font-bold px-4 py-2 rounded-lg transition"
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