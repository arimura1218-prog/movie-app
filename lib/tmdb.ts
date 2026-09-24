// lib/tmdb.ts
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBResult {
  id: number;
  title?: string;       // 映画用タイトル
  name?: string;        // ドラマ用タイトル
  poster_path: string | null;
  media_type: 'movie' | 'tv';
}

/**
 * タイトルからTMDBを検索し、作品の候補一覧を返す
 */
export async function searchTMDB(query: string, type: 'movie' | 'tv' = 'movie'): Promise<TMDBResult[]> {
  if (!query.trim()) return [];

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&language=ja-JP&query=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('TMDB API Error:', error);
    return [];
  }
}

/**
 * ポスター画像の完全なURLを取得するヘルパー
 */
export function getTMDBImageUrl(posterPath: string | null, size: string = 'w500'): string {
  if (!posterPath) return '';
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}