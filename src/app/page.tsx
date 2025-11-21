// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import StatusCard from "@/components/StatusCard";
import ParseForm from "@/components/ParseForm";
import KeywordsTable from "@/components/KeywordsTable";
import VideosTable from "@/components/VideosTable";
import { useStatus } from "@/hooks/useStatus";
import { useKeywords } from "@/hooks/useKeywords";
import { useVideos, type VideoSort } from "@/hooks/useVideos";

export default function DashboardPage() {
  const [selectedKeyword, setSelectedKeyword] = useState("");


  const [sort, setSort] = useState<VideoSort>("delta");
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyHot, setOnlyHot] = useState(false);

  const statusHook = useStatus();
  const keywordsHook = useKeywords();

  const allKeywords = keywordsHook.keywords.map((k) => k.keyword);


  const [videoKeywordFilter, setVideoKeywordFilter] = useState<string>("");


  useEffect(() => {
    if (allKeywords.length > 0 && !selectedKeyword && !videoKeywordFilter) {
      const first = allKeywords[0];
      setSelectedKeyword(first);
      setVideoKeywordFilter(first);
    }
  }, [allKeywords, selectedKeyword, videoKeywordFilter]);


  const videoKeywordsForHook = videoKeywordFilter ? [videoKeywordFilter] : [];

  const videosHook = useVideos(videoKeywordsForHook, sort, onlyNew, onlyHot);

  const handleParsed = async () => {
    await Promise.all([
      statusHook.refresh(),
      keywordsHook.refresh(),
      videosHook.refresh(),
    ]);
  };

  const handleSelectKeyword = (kw: string) => {
    setSelectedKeyword(kw);
    setVideoKeywordFilter(kw);
  };


  const handleVideoKeywordChange = (kw: string) => {
    setVideoKeywordFilter(kw);
    if (kw) setSelectedKeyword(kw);
  };

  const activeKeywordForForm = selectedKeyword || allKeywords[0] || "";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#00A651]/10 px-3 py-1 text-xs font-medium text-[#007f3d] mb-2">
            <span className="h-2 w-2 rounded-full bg-[#00A651]" />
            Внутренний дашборд
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Поиск роликов в TikTok
          </h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500">
            Шаг 1 — вводим слово. Шаг 2 — жмём кнопку. Шаг 3 — смотрим ролики
            ниже 😊
          </p>
        </div>
        <div className="text-xs md:text-sm text-slate-400 md:text-right">
          Рабочая экосистема SaleScout · быстрый поиск по ключевым словам
        </div>
      </header>


      <div className="grid gap-4 md:gap-6 lg:grid-cols-3 items-stretch mb-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-5">
          <StatusCard
            status={statusHook.status}
            loading={statusHook.loading}
            onRefresh={statusHook.refresh}
          />

          <ParseForm
            initialKeyword={activeKeywordForForm}
            isParserRunning={!!statusHook.status?.parser.isRunning}
            onParsed={handleParsed}
          />
        </div>

        <div className="lg:col-span-1 h-full">
          <KeywordsTable
            keywords={keywordsHook.keywords}
            loading={keywordsHook.loading}
            selectedKeyword={selectedKeyword}
            onSelectKeyword={handleSelectKeyword}
          />
        </div>
      </div>


      <VideosTable
        videos={videosHook.videos}
        loading={videosHook.loading}
        total={videosHook.total}
        page={videosHook.page}
        totalPages={videosHook.totalPages}
        onPageChange={videosHook.setPage}
        sort={sort}
        onSortChange={setSort}
        onlyNew={onlyNew}
        onlyHot={onlyHot}
        onToggleOnlyNew={() => setOnlyNew((v) => !v)}
        onToggleOnlyHot={() => setOnlyHot((v) => !v)}
        allKeywords={allKeywords}
        keywordFilter={videoKeywordFilter}
        onKeywordFilterChange={handleVideoKeywordChange}
      />
    </main>
  );
}
