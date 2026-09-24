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
 * タイトルからTMDBを検索し、作品の候補一覧を返す（邦題の表記ゆれ対応版）
 */
export async function searchTMDB(query: string, type: 'movie' | 'tv' = 'movie'): Promise<TMDBResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    // 1. まずはそのまま検索
    let results = await fetchTMDB(trimmed, type);

    // 2. もし結果が0件の場合、表記ゆれ（中黒やスペースの削除など）を試す
    if (results.length === 0) {
      // 中黒（・）やスペースを削除したクエリを作成
      const normalizedQuery = trimmed.replace(/[・\s]/g, '');
      if (normalizedQuery !== trimmed) {
        results = await fetchTMDB(normalizedQuery, type);
      }
    }

    return results;
  } catch (error) {
    console.error('TMDB API Error:', error);
    return [];
  }
}

// 内部用：実際にAPIを叩くヘルパー関数
async function fetchTMDB(query: string, type: 'movie' | 'tv'): Promise<TMDBResult[]> {
  const res = await fetch(
    `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&language=ja-JP&query=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  return data.results || [];
}

/**
 * ポスター画像の完全なURLを取得するヘルパー
 */
export function getTMDBImageUrl(posterPath: string | null, size: string = 'w500'): string {
  if (!posterPath) return '';
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}