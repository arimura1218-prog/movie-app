'use client';

import { useState, useEffect } from 'react';

export function useMediaType() {
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>(() => {
    if (typeof window === 'undefined') return 'movie';
    const saved = localStorage.getItem('selectedMediaType');
    return (saved === 'movie' || saved === 'tv') ? saved : 'movie';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedMediaType', mediaType);
    }
  }, [mediaType]);

  return [mediaType, setMediaType] as const;
}