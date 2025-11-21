// src/hooks/useVideos.ts
"use client";

import { useEffect, useState } from "react";
import type { VideoItem, VideosResponse } from "@/types/tiktok";

const API_BASE = process.env.NEXT_PUBLIC_API || "/api";

export type VideoSort = "delta" | "views" | "created";

export function useVideos(
  keywords: string[], 
  sort: VideoSort,
  onlyNew: boolean,
  onlyHot: boolean,
) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  async function load(
    kws: string[] = keywords,
    p = page,
    s: VideoSort = sort,
    n = onlyNew,
    h = onlyHot,
  ) {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", String(limit));
      params.set("sort", s);

      if (kws && kws.length > 0) {
        params.set("keywords", kws.join(","));
      }
      if (n) params.set("onlyNew", "1");
      if (h) params.set("onlyHot", "1");

      const res = await fetch(`${API_BASE}/videos?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load videos");

      const data = (await res.json()) as VideosResponse;
      setVideos(data.items);
      setTotal(data.total);
      setTotalPages(data.total > 0 ? Math.ceil(data.total / limit) : 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    load(keywords, 1, sort, onlyNew, onlyHot);
  }, [keywords, sort, onlyNew, onlyHot]);

  useEffect(() => {
    load(keywords, page, sort, onlyNew, onlyHot);
  }, [page]);

  function refresh() {
    load();
  }

  return { videos, total, page, totalPages, loading, setPage, refresh };
}
