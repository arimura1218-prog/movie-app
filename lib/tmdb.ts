const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://image.tmdb.org/t/p'; // または api.themoviedb.org/3

export interface TMDBResult {
  id: number;
  title?: string;       // 映画用
  name?: string;        // ドラマ・アニメ用
  poster_path: string | null;
  media_type: 'movie' | 'tv' | 'person';
}

/**
 * TMDBのマルチ検索（映画・ドラマを同時に検索）を使ってヒット率を上げる
 */
export async function searchTMDB(query: string, type?: 'movie' | 'tv' = 'movie'): Promise<TMDBResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    // 映画とドラマを同時に探せる /search/multi を使用する
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=ja-JP&query=${encodeURIComponent(trimmed)}`
    );
    const data = await res.json();
    
    // 映画(movie) または テレビ番組(tv) の結果だけを絞り込んで返す
    const results = (data.results || []).filter(
      (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
    );

    return results;
  } catch (error) {
    console.error('TMDB API Error:', error);
    return [];
  }
}

/**
 * ポスター画像のURLを取得
 */
export function getTMDBImageUrl(posterPath: string | null, size: string = 'w500'): string {
  if (!posterPath) return '';
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}