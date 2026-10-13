import React from 'react';
import { useMediaType } from './useMediaType'; // 上記フックのパス

export default function MediaSelectorComponent() {
  const [mediaType, setMediaType] = useMediaType();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">表示モード: {mediaType === 'movie' ? '映画' : 'ドラマ'}</h2>
      
      <div className="flex gap-4">
        <button
          onClick={() => setMediaType('movie')}
          className={`px-4 py-2 rounded ${mediaType === 'movie' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          映画 (Movie)
        </button>
        <button
          onClick={() => setMediaType('tv')}
          className={`px-4 py-2 rounded ${mediaType === 'tv' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          ドラマ (TV Show)
        </button>
      </div>
    </div>
  );
}