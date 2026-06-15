import { useState, useEffect } from "react";

const RANK_KEY = "argenretro-xi-ranking";

export function useRanking() {
  const [ranking, setRanking] = useState<number[]>([]);

  useEffect(() => {
    const scores = window.localStorage.getItem(RANK_KEY);
    if (scores) {
      try {
        setRanking(JSON.parse(scores) as number[]);
      } catch {
        window.localStorage.removeItem(RANK_KEY);
      }
    }
  }, []);

  const saveRanking = (score: number) => {
    setRanking((prev) => {
      const next = [...prev, score].sort((a, b) => b - a).slice(0, 5);
      window.localStorage.setItem(RANK_KEY, JSON.stringify(next));
      return next;
    });
  };

  return { ranking, saveRanking };
}
