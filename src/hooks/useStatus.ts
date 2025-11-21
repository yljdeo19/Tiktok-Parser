// src/hooks/useStatus.ts
"use client";

import { useEffect, useState } from "react";
import type { StatusResponse } from "@/types/tiktok";

const API_BASE = process.env.NEXT_PUBLIC_API || "/api";

export function useStatus() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetch(`${API_BASE}/status`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load status");
      const data = (await res.json()) as StatusResponse;
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  return { status, loading, refresh };
}
