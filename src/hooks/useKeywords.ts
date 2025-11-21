// src/hooks/useKeywords.ts
"use client";

import { useEffect, useState } from "react";
import type { KeywordStat } from "@/types/tiktok";

const API_BASE = process.env.NEXT_PUBLIC_API || "/api";

export function useKeywords() {
  const [keywords, setKeywords] = useState<KeywordStat[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/keywords`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load keywords");
      const data = (await res.json()) as KeywordStat[];
      setKeywords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return { keywords, loading, refresh };
}
